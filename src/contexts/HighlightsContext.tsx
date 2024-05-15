import { useContext, StateUpdater } from "preact/hooks";
import { createContext, Dispatch } from "preact/compat";
import { useEffect, useState, useRef } from "preact/hooks";
import { useTreeContext } from "../contexts/TagTreeContext";
import { dbs } from "../signals";
export const HighlightsContext = createContext({
  hlIds: ([] as Taguette.Highlight[]).map((hl) => hl.id),
  infoText: "",
  numHlts: 0,
});
export function HighlightsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [numHlts, setNumHlts] = useState<number>(0);
  const [hlIds, setHlIds] = useState<number[]>([]);
  const { selectedTags } = useTreeContext();
  const tagsAreSelected = selectedTags.length > 0;
  const infoText = `Showing${
    !tagsAreSelected ? " all" : ""
  } ${numHlts} highlights${
    tagsAreSelected ? ` with any of ${selectedTags.length} selected tags` : ""
  }.`;
  const selectedTagPlaceholders = selectedTags.map((t, i) => `$${i + 1}`);
  const optionsPlaceholder = `${selectedTagPlaceholders.join(",")}`;
  const maybeFilter =
    selectedTags.length === 0 ? "" : `WHERE t.path in (${optionsPlaceholder})`;

  useEffect(() => {
    setNumHlts(hlIds.length);
  }, [hlIds]);

  // useEffect(() => {
  //   console.log("HighlightsProvider useEffect");
  // }, []);
  const prevSelectedTagsRef = useRef<string[]>([]);
  useEffect(() => {
    if (
      numHlts !== 0 &&
      JSON.stringify(prevSelectedTagsRef.current) ===
        JSON.stringify(selectedTags)
    ) {
      prevSelectedTagsRef.current = selectedTags;
      return; // Exit early
    }
    prevSelectedTagsRef.current = selectedTags;
    console.log("HighlightsProvider useEffect");
    const db = dbs.value;
    const q = `
    SELECT DISTINCT h.id
    FROM highlights as h
      LEFT JOIN highlight_tags AS ht
        ON h.id = ht.highlight_id
      LEFT JOIN tags as t
        ON t.id = ht.tag_id
        ${maybeFilter}
    ;`;
    const bindings = selectedTags.reduce(
      ((a, c, i, arr) => {
        a[selectedTagPlaceholders[i]] = c;
        return a;
      }) as reducer,
      {} as Record<string, string>
    );
    db.transactAll([{ sql: q, bindings }]).then(([ids]) => {
      setNumHlts(0);
      setHlIds(ids.map(({ id }) => id));
    });
  }, [selectedTags]);

  return (
    <HighlightsContext.Provider value={{ hlIds, infoText, numHlts }}>
      {children}
    </HighlightsContext.Provider>
  );
}

export function useHighlightsContext() {
  const context = useContext(HighlightsContext);
  if (context === undefined) {
    throw new Error("useHighlights must be used within a HighlightsProvider");
  }
  return context;
}

type reducer = typeof _reducer;
function _reducer(
  accumulator: Record<string, string>,
  currentValue: string,
  currentIndex: number,
  initialValue: string[]
): typeof accumulator {
  return accumulator;
}
