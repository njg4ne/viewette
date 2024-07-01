import { memo, useEffect, useMemo, useRef, useState } from "preact/compat";
import { TagChip } from "../../../TagChip";
import { TreeItem2, TreeItem2Props } from "@mui/x-tree-view/TreeItem2";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { getAllItemIds } from "../TagTree2";
import { useTreeViewApiRef } from "@mui/x-tree-view";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import TextIcon from "@mui/icons-material/Subject";
import DragIndicator from "@mui/icons-material/DragIndicator";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import TagIcon from "@mui/icons-material/Sell";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { DragWrapper, DropWrapper } from "../Dnd";
import { ExpansionControl } from "../../../ExpansionControl";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// import { _CustomTreeItem as CTagTreeItem } from "../_CustomTreeItem";
// const Memoed = memo(
//   TagTreeItem,
//   (a, b) => console.log("compare", a, b) || true
// );
export default function TagTreeItem(
  props: TreeItem2Props & { apiRef: React.MutableRefObject<any> }
) {
  const { itemId, label, apiRef } = props;
  const item = apiRef.current?.getItem(itemId);
  const family = item ? getAllItemIds([item]) : [];
  const refsAlive = item && item.path && family;
  const newLabel = (
    <Stack direction="row" spacing={1}>
      <TagChip sx={{ maxWidth: "max-content" }} tag={label as string} />
      {refsAlive && (
        <DragWrapper item={item} sx={{ alignSelf: "center" }}>
          <TagGroupDragHandle value={family.length} />
        </DragWrapper>
      )}
    </Stack>
  );
  //   useEffect(() => {
  //     console.log("rerender");
  //   });
  return (
    <DropWrapper item={item}>
      <TreeItem2
        {...props}
        label={newLabel}
        slots={{
          expandIcon: ExpandMoreIcon,
          collapseIcon: ChevronRightIcon,
          endIcon: TagIcon,
        }}
      />
    </DropWrapper>
  );
}

function TagGroupDragHandle({ value }: { value: number }) {
  return (
    <Stack
      direction="row"
      component={Paper}
      variant="outlined"
      spacing={0.25}
      sx={{
        backgroundColor: "primary.200",
        backgroundImage: "primary.200",
        color: "black",
        alignItems: "center",
        alignSelf: "center",
        px: 0.25,
      }}
    >
      <DragIndicator fontSize="small" sx={{ transform: "rotate(90deg)" }} />
      <Divider orientation="vertical" flexItem />
      <TagIcon sx={{ color: "primary.900", fontSize: "1rem" }} />
      <Typography>
        <Typography fontSize="small" sx={{ px: 0.25, fontWeight: "600" }}>
          {value}
        </Typography>
      </Typography>
    </Stack>
  );
}
