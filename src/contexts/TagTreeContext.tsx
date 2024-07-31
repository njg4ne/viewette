import { Dispatch, StateUpdater, useMemo } from "preact/hooks";
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
import { useModalContext } from "./ModalContext";
import { useFetchTags, useQueryBuilderSql } from "../components/QueryBuilder";
// import { db } from "../db/models/TaguetteDb.ts";
type TagMap = Record<string | number, string>;
export type ItemTagMap = Map<string, Taguette.Tag | undefined>;

const defaults = {
  expandedItems: new Map<string, Taguette.Tag | undefined>(),
  setExpandedItems: {} as Dispatch<StateUpdater<ItemTagMap>>,
  selectedItems: [] as string[],
  setSelectedItems: {} as Dispatch<StateUpdater<string[]>>,
  // createTagValue: "" as string,
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
  allTagsUnfiltered: [] as Taguette.Tag[],
  taggings: [] as Taguette.TaggingSummary[],
  selectedTags: [] as string[],
  // newTagInputValue: "" as string,
  // setNewTagInputValueDebounced: {} as (value: string) => void,
  // setNewTagInputValueImmediate: {} as (value: string) => void,
};
export const TreeContext = createContext(defaults);
export function TreeProvider({ children }: { children: React.ReactNode }) {
  const { enqueueSnackbar: sbqr } = useSnackbar();
  const { setModalActions } = useModalContext();
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
  // const [allTagsUnfiltered, setAllTagsUnfiltered] = useState<Taguette.Tag[]>(
  //   []
  // );
  // const [allTags, setAllTags] = useState<Taguette.Tag[]>([]);
  // const allTags = allTagsUnfiltered.filter((tag) =>
  //   tag.path.toLowerCase().includes(tagLikeFilter.toLowerCase())
  // );
  const [taggings, setTaggings] = useState<Taguette.TaggingSummary[]>([]);
  const [expandedItems, setExpandedItems] = useState<ItemTagMap>(
    new Map<string, Taguette.Tag | undefined>()
  );
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  // const [createTagValue, setCreateTagValue] = useState<string>("");
  const [tags, setTags] = useState<TagMap>({});

  // const qb = useQueryBuilder();
  // useEffect(() => {
  //   console.log("qb", qb);
  // }, [qb]);
  // const querySql = "1 = 1";

  const allTagsUnfiltered = useFetchTags(false);
  const allTags = useFetchTags(true);
  useEffect(() => {
    // console.log("allTagsUnfiltered SET");
    setExpandedItems((prev) => getItemTagMapForTags(allTags, prev));
  }, [allTags]);

  // const allTags = useFetchTags(true);

  // useEffect(() => {
  //   if (loading || !signalReady(dbs)) return;
  //   const db = dbs.value;
  //   const whereClause = `WHERE ${querySql}`;
  //   const filterSql = `SELECT * FROM tags ${whereClause};`;
  //   db.transactAll([{ sql: filterSql, }]).then(([newTags]) => {
  //     setAllTagsUnfiltered(newTags as Taguette.Tag[]);

  //     // console.log("setAllTags", ...newTags);
  //     setExpandedItems((prev) => getItemTagMapForTags(newTags, prev));
  //   });
  // }, [loading, dbs.value /*tagLikeFilter*/, querySql]);

  // useEffect(() => {
  //   const newTagsFiltered = allTagsUnfiltered.filter((tag) =>
  //     tag.path.toLowerCase().includes(tagLikeFilter.toLowerCase())
  //   );
  //   setAllTags(newTagsFiltered);
  // }, [tagLikeFilter, allTagsUnfiltered]);

  const apiRef = useTreeViewApiRef();
  const selectedTags = selectedItems.filter((path) =>
    allTags.map((tag) => tag.path).includes(path)
  );
  const numTagsSelected = selectedTags.length;
  useHotkeys("delete", () => {
    if (numTagsSelected === 0) return;
    const msg = `Delete ${numTagsSelected} tag${
      numTagsSelected > 1 ? "s" : ""
    }`;
    const actions = {
      delete: [msg, () => deleteTags(selectedTags)],
    };
    setModalActions(actions);
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
        // createTagValue,
        tags,
        setTags,
        numTagsSelected,
        apiRef,
        allTags,
        allTagsUnfiltered,
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
