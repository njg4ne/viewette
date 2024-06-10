import { Dispatch, StateUpdater } from "preact/hooks";
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
import { TagTreeItem } from "../components/TagTree/TagTreeItems/MultipleTagTreeItems";
import useDebouncedSearchParam from "../hooks/useDebouncedSearchParam";
import { useSearchParamContext } from "./SearchParamContext";
// import { db } from "../db/models/TaguetteDb.ts";
type TagMap = Record<string | number, string>;
type ItemTagMap = Map<string, Taguette.Tag | undefined>;

const defaults = {
  expandedItems: new Map<string, Taguette.Tag | undefined>(),
  setExpandedItems: {} as Dispatch<StateUpdater<ItemTagMap>>,
  selectedItems: [] as string[],
  setSelectedItems: {} as Dispatch<StateUpdater<string[]>>,
  createTagValue: "" as string,
  tags: {} as TagMap,
  setTags: {} as Dispatch<StateUpdater<TagMap>>,
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
  // newTagInputValue: "" as string,
  // setNewTagInputValueDebounced: {} as (value: string) => void,
  // setNewTagInputValueImmediate: {} as (value: string) => void,
};
export const TreeContext = createContext(defaults);
export function TreeProvider({ children }: { children: React.ReactNode }) {
  const { enqueueSnackbar: sbqr } = useSnackbar();
  // const [searchParams, setSearchParams] = useSearchParams();
  const [, , , tagLikeFilter] = useSearchParamContext("tagLike");
  // console.log("tagLikeFilter", tagLikeFilter);
  // const tagLikeFilter = "";

  // const tagLikeFilter = useSearchParamContext("tagLike") || "";
  // const [
  //   newTagInputValue,
  //   setNewTagInputValueDebounced,
  //   setNewTagInputValueImmediate,
  // ] = useDebouncedSearchParam({
  //   key: "newTag",
  // });

  const { loading, setLoading } = useLoadingContext();
  const [allTags, setAllTags] = useState<Taguette.Tag[]>([]);
  const [taggings, setTaggings] = useState<Taguette.ParentTaggingCount[]>([]);
  const [expandedItems, setExpandedItems] = useState<ItemTagMap>(
    new Map<string, Taguette.Tag | undefined>()
  );
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
      // console.log("setAllTags", newTags);
      setExpandedItems((prev) => getItemTagMapForTags(newTags, prev));
    });
  }, [loading, dbs.value, tagLikeFilter]);

  const apiRef = useTreeViewApiRef();
  const selectedTags = selectedItems.filter((path) =>
    allTags.map((tag) => tag.path).includes(path)
  );
  const numTagsSelected = selectedTags.length;
  useHotkeys("delete", () => {
    if (numTagsSelected === 0) return;
    deleteTags(selectedTags);
  });

  useEffect(() => {
    if (loading || !signalReady(dbs) || allTags.length === 0) return;
    const db: TaguetteDb = dbs.value;
    db.read.taggingsByPath(allItemPaths(allTags)).then((taggings) => {
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
        tags,
        setTags,
        numTagsSelected,
        apiRef,
        allTags,
        taggings,
        selectedTags,
        // newTagInputValue,
        // setNewTagInputValueDebounced,
        // setNewTagInputValueImmediate,
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
  res.sort();
  return [...new Set(res)];
}

function allItemPathsUnsorted(tags: Taguette.Tag[]): string[] {
  return tags.reduce((acc: string[], tag: Taguette.Tag) => {
    const morePaths = getAllPartialPaths(tag.path);
    acc.push(...morePaths);
    return acc;
  }, []);
}

function getItemTagMapForTags(
  tags: Taguette.Tag[],
  iTMap: ItemTagMap
): ItemTagMap {
  return tags.reduce((iTMap: ItemTagMap, tag: Taguette.Tag) => {
    const familyPaths = getAllPartialPaths(tag.path);
    familyPaths.forEach((path) => {
      if (tag.path === path) {
        iTMap.set(path, tag);
      } else if (!iTMap.has(path)) {
        iTMap.set(path, undefined);
      }
    });
    return iTMap;
  }, iTMap);
}
