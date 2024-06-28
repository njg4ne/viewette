import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {} from "@redux-devtools/extension"; // required for devtools typing

// const [allTagsUnfiltered, setAllTagsUnfiltered] = useState<Taguette.Tag[]>([]);
// const [allTags, setAllTags] = useState<Taguette.Tag[]>([]);
// const [taggings, setTaggings] = useState<Taguette.ParentTaggingCount[]>([]);
// const [expandedItems, setExpandedItems] = useState<ItemTagMap>(
//   new Map<string, Taguette.Tag | undefined>()
// );
// const [selectedItems, setSelectedItems] = useState<string[]>([]);
// const [createTagValue, setCreateTagValue] = useState<string>("");
// const [tags, setTags] = useState<TagMap>({});

interface TagTreeState {
  tagsUnfiltered: Taguette.Tag[];
  tags: Taguette.Tag[];
  taggings: Taguette.ParentTaggingCount[];
  expandedItems: ItemTagMap;
  selectedItems: string[];
}

type Setter = (partial: TagTreeState | Partial<TagTreeState> | ((state: TagTreeState) => TagTreeState | Partial<TagTreeState>), replace?: boolean | undefined) => void;

const setSelectedItems = set: Setter => 

const useTreeStore = create<TagTreeState>((set) => ({
  tagsUnfiltered: [],
  tags: [],
  taggings: [],
  expandedItems: new Map<string, Taguette.Tag | undefined>() as ItemTagMap,
  selectedItems: [],
}));

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
import { useLoadingContext } from "../contexts/LoadingContext";
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
import { useSearchParamContext } from "../contexts/SearchParamContext";
import { useModalContext } from "../contexts/ModalContext";
// import { db } from "../db/models/TaguetteDb.ts";
type TagMap = Record<string | number, string>;
export type ItemTagMap = Map<string, Taguette.Tag | undefined>;

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
  allTagsUnfiltered: [] as Taguette.Tag[],
  taggings: [] as Taguette.ParentTaggingCount[],
  selectedTags: [] as string[],
  // newTagInputValue: "" as string,
  // setNewTagInputValueDebounced: {} as (value: string) => void,
  // setNewTagInputValueImmediate: {} as (value: string) => void,
};
export const TreeContext = createContext(defaults);
export function TreeProvider() {
  const { enqueueSnackbar: sbqr } = useSnackbar();
  const { setModalActions } = useModalContext();
  const [, , , tagLikeFilter] = useSearchParamContext("tagLike");
  const { loading, setLoading } = useLoadingContext();

  useEffect(() => {
    if (loading || !signalReady(dbs)) return;
    const db = dbs.value;
    const backendTagLikeFilter = ""; //tagLikeFilter;
    const bindings = { $tagLike: `%${backendTagLikeFilter}%` };
    const sql = `SELECT * FROM tags${
      backendTagLikeFilter.length > 0 ? ` WHERE path LIKE $tagLike` : ""
    };`;
    db.transactAll([{ sql, bindings }]).then(([newTags]) => {
      setAllTagsUnfiltered(newTags as Taguette.Tag[]);

      // console.log("setAllTags", ...newTags);
      setExpandedItems((prev) => getItemTagMapForTags(newTags, prev));
    });
  }, [loading, dbs.value /*tagLikeFilter*/]);

  useEffect(() => {
    const newTagsFiltered = allTagsUnfiltered.filter((tag) =>
      tag.path.toLowerCase().includes(tagLikeFilter.toLowerCase())
    );
    setAllTags(newTagsFiltered);
  }, [tagLikeFilter, allTagsUnfiltered]);

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
  const value = {
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
    allTagsUnfiltered,
    taggings,
    selectedTags,
  };
  return value;
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
