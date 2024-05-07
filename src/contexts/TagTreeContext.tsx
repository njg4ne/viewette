import { StateUpdater } from "preact/hooks";
import {
  useState,
  createContext,
  useContext,
  useEffect,
  useRef,
  MutableRefObject,
} from "react";
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
// import { db } from "../db/models/TaguetteDb.ts";
type TagMap = Record<string | number, string>;

const defaults = {
  expandedItems: [] as string[],
  setExpandedItems: {} as StateUpdater<string[]>,
  selectedItems: [] as string[],
  setSelectedItems: {} as StateUpdater<string[]>,
  createTagValue: "" as string,
  setCreateTagValue: {} as StateUpdater<string>,
  createTagFieldRef: {} as React.RefObject<HTMLElement>,
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
};
export const TreeContext = createContext(defaults);

export function TreeProvider({ children }: { children: React.ReactNode }) {
  const { enqueueSnackbar: sbqr } = useSnackbar();

  const { loading, setLoading } = useLoadingContext();
  const [allTags, setAllTags] = useState<Taguette.Tag[]>([]);
  const [taggings, setTaggings] = useState<Taguette.ParentTaggingCount[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [createTagValue, setCreateTagValue] = useState<string>("");
  const [tags, setTags] = useState<TagMap>({});
  const createTagFieldRef = useRef<HTMLElement>(null);
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
    if (loading || !signalReady(dbs)) return;
    const db = dbs.value;
    db.read.tags().then(setAllTags);
  }, [loading, dbs.value]);

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
        setCreateTagValue,
        createTagFieldRef,
        tags,
        setTags,
        numTagsSelected,
        apiRef,
        allTags,
        taggings,
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
