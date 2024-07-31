import { StateUpdater } from "preact/hooks";
import {
  useState,
  createContext,
  useContext,
  MutableRefObject,
} from "preact/compat";
import { useTreeContext } from "../../../contexts/TagTreeContext";
import { UseTreeViewExpansionPublicAPI } from "@mui/x-tree-view/internals/plugins/useTreeViewExpansion/useTreeViewExpansion.types";
import { UseTreeViewFocusPublicAPI } from "@mui/x-tree-view/internals/plugins/useTreeViewFocus/useTreeViewFocus.types";
import { UseTreeViewItemsPublicAPI } from "@mui/x-tree-view/internals/plugins/useTreeViewItems/useTreeViewItems.types";
import { getGenealogy, getTagParts } from "../utils";
import { TagTreeItem } from "./MultipleTagTreeItems";
// import { useHotkeys } from "react-hotkeys-hook";
type Position = { mouseX: number; mouseY: number } | null;

// type TagTreeItemData = {
//   // item={{ tagId: id, label, level, partialPath, isTag }}
//   // tagId: string | number;
//   // label: string;
//   level: number;
//   // partialPath: string;
//   // isTag: boolean;
// };

export const TagTreeItemContext = createContext({
  closeContextMenu: () => {},
  handleContextMenu: (_e: MouseEvent) => {},
  contextMenuPosition: null as Position,
  item: {} as TagTreeItem,
});
type PropTypes = {
  item: TagTreeItem;
  children: JSX.Element;
};
export function TagTreeItemProvider({ item, children }: PropTypes) {
  const { allTags, taggings } = useTreeContext();
  const [contextMenu, setContextMenu] = useState<Position>(null);
  const handleContextMenu = (e: MouseEvent) =>
    contextMenuHandlerFactory(contextMenu, setContextMenu, apiRef, e)(e);
  const closeContextMenu = () => setContextMenu(null);
  const { apiRef } = useTreeContext();
  let { hlCount, docCount } = taggings.find(({ parentPath }) => {
    return item.path === parentPath;
  }) || { hlCount: 0, docCount: 0 };
  const tag: Taguette.Tag | undefined = allTags.find(
    (tag) => tag.path === item.path
  );

  // const family = getGenealogy([item.partialPath], tags);
  // const familyTags = family.filter(
  //   (path) =>
  //     path !== item.partialPath || (item.isTag && path === item.partialPath)
  // );
  // const numTagsInFamily = item.group.length - (!item.isTag ? 1 : 0);
  return (
    <TagTreeItemContext.Provider
      value={{
        closeContextMenu,
        handleContextMenu,
        contextMenuPosition: contextMenu,
        item: { ...item, hlCount, docCount, tag },
      }}
    >
      {children}
    </TagTreeItemContext.Provider>
  );
}

export function useTagTreeItemContext() {
  const context = useContext(TagTreeItemContext);
  if (context === undefined) {
    throw new Error("useTagTreeItem must be used within a TagTreeItemProvider");
  }
  return context;
}

const contextMenuHandlerFactory =
  (
    contextMenu: Position,
    setContextMenu: StateUpdater<Position>,
    apiRef: MutableRefObject<
      | (UseTreeViewItemsPublicAPI<any> &
          UseTreeViewExpansionPublicAPI &
          UseTreeViewFocusPublicAPI)
      | undefined
    >,
    event: MouseEvent
  ) =>
  (event: MouseEvent) => {
    // apiRef.current?.focusItem
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null
    );
  };
