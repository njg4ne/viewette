import { useDraggable, useDroppable } from "@dnd-kit/core";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";

export const DragWrapper = ({
  children,
  item,
  sx,
}: {
  children: React.ReactNode;
  item: Viewette.TagTree.Item;
  sx?: any;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef: dragRef,
  } = useDraggable({
    id: `draggables.${item.path}`,
    data: { tag: item },
  });
  return (
    // @ts-ignore
    <Box {...listeners} {...attributes} ref={dragRef} sx={sx}>
      {children}
    </Box>
  );
};

export const DropWrapper = ({
  children,
  item,
}: {
  children: React.ReactNode;
  item: Viewette.TagTree.Item;
}) => {
  const { isOver, setNodeRef: dropRef } = useDroppable({
    id: `droppables.${item.path}`,
    data: { tag: item },
  });
  const textPrimary = useTheme().palette?.text?.primary || "green";
  return (
    <Box
      // @ts-ignore
      ref={dropRef}
      sx={{
        border: isOver ? `.125rem dashed ${textPrimary}` : "",
        // backgroundColor: isOver ? `${textPrimary}` : "transparent",
      }}
    >
      {children}
    </Box>
  );
};
