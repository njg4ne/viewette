import { ContextMenu } from "./ContextMenu";
import Stack from "@mui/material/Stack";
import { useSnackbar } from "notistack";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState, useRef } from "react";
import { opfsDb } from "../../../signals";
import Divider from "@mui/material/Divider";

import TagIcon from "@mui/icons-material/Sell";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Typography from "@mui/material/Typography";
import ChildIcon from "@mui/icons-material/SubdirectoryArrowRight";

import { useLoadingContext } from "../contexts/Loading";
import { useTreeContext } from "../contexts/Tree";
import { TagTreeItemContextProvider, useTagTreeItemContext } from "./Context";
import { SEPARATOR } from "../utils";
import StyledTreeItem from "./StyledTreeItem";
import RenderMultipleTagTreeItems from "./Multiple";

type TagTreeItemProps = {
  tag: Tag.Entry;
  tags: Tag.Entry[];
  level: number;
  isTag: boolean;
  partialPath: string;
};
export default function RenderSingleTagTreeItem({
  tag,
  level,
  tags,
  isTag,
  partialPath,
}: TagTreeItemProps) {
  const { loading, setLoading } = useLoadingContext();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { createTagFieldRef, setCreateTagValue, selectedItems } =
    useTreeContext();
  // const { closeContextMenu, handleContextMenu, contextMenuPosition } = useTagTreeItemContext();
  const ref = useRef<HTMLDivElement>(null);
  const [id, path] = tag;
  const parts = path.split(SEPARATOR);
  const label = parts.at(level) || "";

  const ttText = isTag ? path : `category '${label}'`;

  return (
    <TagTreeItemContextProvider>
      <Item
        partialPath={partialPath}
        label={label}
        isTag={isTag}
        tags={tags}
        level={level}
      />
    </TagTreeItemContextProvider>
  );
}

function Item({
  partialPath,
  label,
  isTag,
  tags,
  level,
}: {
  partialPath: string;
  label: string;
  isTag: boolean;
  tags: Tag.Entry[];
  level: number;
}) {
  const { handleContextMenu } = useTagTreeItemContext();
  const sx = {
    wordWrap: "break-word",
    whiteSpace: "normal",
    py: 0.5,
    px: 1,
    borderRadius: 1,
    maxWidth: "100%",
    width: "fit-content",
  };
  return (
    <StyledTreeItem
      key={partialPath} // sx={{ cursor: 'context-menu' }}
      itemId={partialPath}
      label={
        <Stack
          spacing={0}
          direction="row"
          alignItems={"center"}
          onContextMenu={handleContextMenu}
        >
          <Typography
            children={label} // placement="right"
            sx={{
              bgcolor: `primary.${isTag ? "main" : "100"}`,
              color: "primary.contrastText",
              ...sx,
            }}
          />
          <ContextMenu isTag={isTag} label={partialPath} />
        </Stack>
      }
    >
      <RenderMultipleTagTreeItems tags={tags} level={level} />
    </StyledTreeItem>
  );
}
