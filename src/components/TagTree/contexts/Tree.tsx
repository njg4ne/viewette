import { StateUpdater } from "preact/hooks";
import {
  useState,
  createContext,
  useContext,
  useRef,
  MutableRefObject,
} from "react";
import { useTreeViewApiRef } from "@mui/x-tree-view";
import { UseTreeViewItemsPublicAPI } from "@mui/x-tree-view/internals/plugins/useTreeViewItems/useTreeViewItems.types";
import { UseTreeViewExpansionPublicAPI } from "@mui/x-tree-view/internals/plugins/useTreeViewExpansion/useTreeViewExpansion.types";
import { UseTreeViewFocusPublicAPI } from "@mui/x-tree-view/internals/plugins/useTreeViewFocus/useTreeViewFocus.types";
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
};
export const TreeContext = createContext(defaults);

export function TreeProvider({ children }: { children: React.ReactNode }) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [createTagValue, setCreateTagValue] = useState<string>("");
  const [tags, setTags] = useState<TagMap>({});
  const createTagFieldRef = useRef<HTMLElement>(null);
  const apiRef = useTreeViewApiRef();
  const numTagsSelected = selectedItems.filter((path) =>
    Object.values(tags).includes(path)
  ).length;
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
