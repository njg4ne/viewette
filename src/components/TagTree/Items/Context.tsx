import { StateUpdater } from "preact/hooks";
import { useState, createContext, useContext, MutableRefObject } from "react";
import { useTreeContext } from "../contexts/Tree";
import { UseTreeViewExpansionPublicAPI } from "@mui/x-tree-view/internals/plugins/useTreeViewExpansion/useTreeViewExpansion.types";
import { UseTreeViewFocusPublicAPI } from "@mui/x-tree-view/internals/plugins/useTreeViewFocus/useTreeViewFocus.types";
import { UseTreeViewItemsPublicAPI } from "@mui/x-tree-view/internals/plugins/useTreeViewItems/useTreeViewItems.types";

type Position = { mouseX: number; mouseY: number } | null;

export const TagTreeItemContext = createContext({
  closeContextMenu: () => {},
  handleContextMenu: (_e: MouseEvent) => {},
  contextMenuPosition: null as Position,
});

export function TagTreeItemContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [contextMenu, setContextMenu] = useState<Position>(null);
  const handleContextMenu = (e: MouseEvent) =>
    contextMenuHandlerFactory(contextMenu, setContextMenu, apiRef, e)(e);
  const closeContextMenu = () => setContextMenu(null);
  const { apiRef } = useTreeContext();
  return (
    <TagTreeItemContext.Provider
      value={{
        closeContextMenu,
        handleContextMenu,
        contextMenuPosition: contextMenu,
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
