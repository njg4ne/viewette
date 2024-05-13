import { StateUpdater } from "preact/hooks";
import {
  useState,
  createContext,
  useContext,
  useEffect,
  useRef,
  MutableRefObject,
} from "preact/compat";
import { useTreeViewApiRef } from "@mui/x-tree-view";
import { UseTreeViewItemsPublicAPI } from "@mui/x-tree-view/internals/plugins/useTreeViewItems/useTreeViewItems.types";
import { UseTreeViewExpansionPublicAPI } from "@mui/x-tree-view/internals/plugins/useTreeViewExpansion/useTreeViewExpansion.types";
import { UseTreeViewFocusPublicAPI } from "@mui/x-tree-view/internals/plugins/useTreeViewFocus/useTreeViewFocus.types";
import { useHotkeys } from "react-hotkeys-hook";
import { useLoadingContext } from "./LoadingContext";
import { dbs, signalReady } from "../signals";
// import { db } from "../db/models/TaguetteDb";
import { TaguetteDb } from "../db";
import { useSnackbar } from "notistack";
import * as popups from "../popups";
import { getAllPartialPaths } from "../components/TagTree/utils";
import { useSearchParams } from "react-router-dom";
import { useDb } from "../hooks";
// import { db } from "../db/models/TaguetteDb.ts";
type TagMap = Record<string | number, string>;

const defaults = {
  expandedItems: [] as string[],
  setExpandedItems: {} as StateUpdater<string[]>,
  selectedItems: [] as string[],
  setSelectedItems: {} as StateUpdater<string[]>,
  createTagValue: "" as string,
  // setCreateTagValue: {} as StateUpdater<string>,
  // createTagFieldRef: {} as React.RefObject<HTMLElement>,
  tags: {} as TagMap,
  setTags: {} as StateUpdater<TagMap>,
  numTagsSelected: 0 as number,
  apiRef: {} as MutableRefObject<
    | (UseTreeViewItemsPublicAPI<any> &
        UseTreeViewExpansionPublicAPI &
        UseTreeViewFocusPublicAPI)
    | undefined
  >,
  allTags: [] as Taguette.Tag[],
  taggings: [] as Taguette.ParentTaggingCount[],
  selectedTags: [] as string[],
};
export const TreeContext = createContext(defaults);

export function TreeProvider({ children }: { children: React.ReactNode }) {
  const { enqueueSnackbar: sbqr } = useSnackbar();
  const [searchParams, setSearchParams] = useSearchParams();
  const tagLikeFilter = searchParams.get("tagLike") || "";

  const { loading, setLoading } = useLoadingContext();
  const [allTags, setAllTags] = useState<Taguette.Tag[]>([]);
  const [taggings, setTaggings] = useState<Taguette.ParentTaggingCount[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [createTagValue, setCreateTagValue] = useState<string>("");
  const [tags, setTags] = useState<TagMap>({});

  useEffect(() => {
    if (loading || !signalReady(dbs)) return;
    const db = dbs.value;
    const bindings = { $tagLike: `%${tagLikeFilter}%` };
    const sql = `SELECT * FROM tags${
      tagLikeFilter.length > 0 ? ` WHERE path LIKE $tagLike` : ""
    };`;
    db.transactAll([{ sql, bindings }]).then(([newTags]) => {
      setAllTags(newTags as Taguette.Tag[]);
    });
    // db.read.tags().then(setAllTags);
  }, [loading, dbs.value, searchParams.get("tagLike")]);

  // let [searchParams, setSearchParams] = useSearchParams();
  // useEffect(() => {
  //   const key = "selected";
  //   let selectedParam = searchParams.get(key);
  //   if (!selectedParam) {
  //     const keepOldAndNullSelected = (prev: URLSearchParams) => {
  //       prev.delete(key);
  //       return prev;
  //     };
  //     setSearchParams(keepOldAndNullSelected);
  //   }
  //   // filter whitespaces of any kind
  //   selectedParam = (selectedParam ?? "").replace(/\s/g, "");
  //   // regular expression for [] with maybe some number of comma-separated numbers inside
  //   const re = /(\d+(?:∪\d+)*)/;
  //   const satisfies = re.test(selectedParam || "");
  //   console.log("satisfies", satisfies, selectedParam);
  //   if (!satisfies) return;
  //   let nums = selectedParam.split("∪").map((s) => parseInt(s));
  //   nums = [...new Set(nums)];
  //   setSearchParams((prev: URLSearchParams) => {
  //     prev.set(key, nums.join("∪"));
  //     return prev;
  //   });
  // }, [searchParams]);

  // const createTagFieldRef = useRef<HTMLElement>(null);
  const apiRef = useTreeViewApiRef();
  const selectedTags = selectedItems.filter((path) =>
    allTags.map((tag) => tag.path).includes(path)
  );
  const numTagsSelected = selectedTags.length;
  useHotkeys("delete", () => {
    if (numTagsSelected === 0) return;
    deleteTags(selectedTags);
  });
  // useEffect(() => {
  //   if (loading || !signalReady(opfsDb)) return;
  //   // console.log("opfsDb", opfsDb.value);
  //   const dbv: TaguetteDb = opfsDb.value;
  //   dbv.read.tags().then(setAllTags);

  // }, [opfsDb.value, loading]);

  useEffect(() => {
    if (loading || !signalReady(dbs) || allTags.length === 0) return;
    // // console.log("opfsDb", opfsDb.value);
    // const dbv: TaguetteDb = opfsDb.value;
    const db: TaguetteDb = dbs.value;
    db.read.taggingsByPath(allItemPaths(allTags)).then((taggings) => {
      // console.log("taggings", taggings);
      setTaggings(taggings);
    });
  }, [allTags, loading, dbs.value]);

  async function deleteTags(paths: string[]) {
    if (loading || !signalReady(dbs)) return;
    try {
      setLoading(true);
      const db: TaguetteDb = dbs.value;
      const num = await db.delete.tags.byExactPaths(paths);
      popups.success(sbqr, `Deleted ${num} tags`);
    } catch (e) {
      console.error(e);
      popups.error(sbqr, `Failed to delete tags`);
    } finally {
      setLoading(false);
    }
  }
  return (
    <TreeContext.Provider
      value={{
        expandedItems,
        setExpandedItems,
        selectedItems,
        setSelectedItems,
        createTagValue,
        // setCreateTagValue,
        // createTagFieldRef,
        tags,
        setTags,
        numTagsSelected,
        apiRef,
        allTags,
        taggings,
        selectedTags,
      }}
    >
      {children}
    </TreeContext.Provider>
  );
}

export function useTreeContext() {
  const context = useContext(TreeContext);
  if (context === undefined) {
    throw new Error("useTree must be used within a TreeProvider");
  }
  return context;
}

function allItemPaths(tags: Taguette.Tag[]): string[] {
  const res = tags.reduce((acc: string[], tag: Taguette.Tag) => {
    const morePaths = getAllPartialPaths(tag.path);
    acc.push(...morePaths);
    return acc;
  }, []);
  // console.log(res);
  res.sort();
  // console.log(res);
  return [...new Set(res)];
}
