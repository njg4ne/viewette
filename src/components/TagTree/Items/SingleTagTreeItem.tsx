import { ContextMenu } from "./ContextMenu";
import Stack from "@mui/material/Stack";
import { useSnackbar } from "notistack";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState, useRef } from "react";
import { opfsDb } from "../../../signals";
import Divider from "@mui/material/Divider";
import FolderIcon from "@mui/icons-material/Folder";
import TagIcon from "@mui/icons-material/Sell";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Typography from "@mui/material/Typography";
import ChildIcon from "@mui/icons-material/SubdirectoryArrowRight";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import StarFolderIcon from "@mui/icons-material/FolderSpecial";
import StarIcon from "@mui/icons-material/Star";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import LaunchIcon from "@mui/icons-material/Launch";

import { useLoadingContext } from "../contexts/LoadingContext";
import { useTreeContext } from "../contexts/TagTreeContext";
import {
  TagTreeItemProvider,
  useTagTreeItemContext,
} from "./TagTreeItemContext";
import { SEPARATOR } from "../utils";
import StyledTreeItem from "./StyledTreeItem";
import RenderMultipleTagTreeItems2 from "./MultipleTagTreeItems";
import { Tooltip } from "@mui/material";
import * as popups from "../../../popups";

export default function RenderSingleTagTreeItem() {
  const { loading, setLoading } = useLoadingContext();
  const { enqueueSnackbar: sbqr, closeSnackbar } = useSnackbar();
  const { createTagFieldRef, setCreateTagValue, selectedItems } =
    useTreeContext();
  const { handleContextMenu, item } = useTagTreeItemContext();
  const ref = useRef<HTMLDivElement>(null);

  const ttText = item.isTag ? item.path : `category '${item.path}'`;
  const ancestors = item.familyTags.filter((tag) => tag.path !== item.path);

  const typeSx = {
    // wordWrap: "break-word",
    whiteSpace: "normal",
    py: 0.5,
    px: 1,
    borderRadius: 1,
    // maxWidth: "100%",
  };
  const Icon = item.isTag ? StarFolderIcon : FolderIcon;
  const actions = [
    {
      label: `view ${item.isTag ? "tag" : "category"}`,
      icon: LaunchIcon,
      action: () => {
        popups.info(sbqr, `view ${item.isTag ? "tag" : "category"}`);
      },
    },
  ];
  return (
    <StyledTreeItem
      // sx={{ color: "text.primary", opacity: 0.8 }}
      slots={{
        expandIcon: Icon,
        collapseIcon: Icon,
        endIcon: TagIcon,
      }}
      key={item.path} // sx={{ cursor: 'context-menu' }}
      itemId={item.path}
      label={
        // <>
        <Tooltip title={ttText} placement="right">
          <Stack
            direction="row"
            spacing={1}
            alignItems={"center"}
            onContextMenu={handleContextMenu}
          >
            <Typography
              // children={item.label} // placement="right"
              sx={{
                bgcolor: `primary.${item.isTag ? "main" : "200"}`,
                color: "primary.contrastText",
                ...typeSx,
              }}
            >
              {item.label}
            </Typography>
            <Typography>{item.useCount > 0 && `(${item.useCount})`}</Typography>
            <ButtonGroup aria-label="tag tree item action button group">
              {actions.map((action) => (
                <Tooltip title={action.label} placement="bottom">
                  <IconButton aria-label={action.label} onClick={action.action}>
                    {action.icon({
                      fontSize: "small",
                      // sx: { color: "grey.400" },
                    })}
                  </IconButton>
                </Tooltip>
              ))}
            </ButtonGroup>
            <ContextMenu />
          </Stack>
        </Tooltip>
        //
        // </>
      }
    >
      {ancestors.length > 0 && (
        <RenderMultipleTagTreeItems2 tags={ancestors} level={item.level} />
      )}
    </StyledTreeItem>
  );
}
