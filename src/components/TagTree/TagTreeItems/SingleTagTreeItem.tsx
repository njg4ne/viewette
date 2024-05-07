import { ContextMenu } from "./ContextMenu";
import Stack from "@mui/material/Stack";
import { useSnackbar } from "notistack";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState, useRef } from "react";
import { signalReady, dbs } from "../../../signals";
import Divider from "@mui/material/Divider";

import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Typography from "@mui/material/Typography";
import ChildIcon from "@mui/icons-material/SubdirectoryArrowRight";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import FolderIcon from "@mui/icons-material/Folder";
import StarFolderIcon from "@mui/icons-material/FolderSpecial";
import TagIcon from "@mui/icons-material/Sell";
import StarIcon from "@mui/icons-material/Star";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import LaunchIcon from "@mui/icons-material/Launch";
import TextIcon from "@mui/icons-material/Subject";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import Paper from "@mui/material/Paper";

import { useLoadingContext } from "../../../contexts/LoadingContext";
import { useTreeContext } from "../../../contexts/TagTreeContext";
import {
  TagTreeItemProvider,
  useTagTreeItemContext,
} from "./TagTreeItemContext";
import { SEPARATOR, getTagParts } from "../utils";
import StyledTreeItem from "./StyledTreeItem";
import RenderMultipleTagTreeItems2, {
  TagTreeItem,
} from "./MultipleTagTreeItems";
import { SxProps, Tooltip } from "@mui/material";
import * as popups from "../../../popups";
import { Link } from "react-router-dom";

export default function RenderSingleTagTreeItem() {
  const { loading, setLoading } = useLoadingContext();
  const { enqueueSnackbar: sbqr, closeSnackbar } = useSnackbar();
  const { createTagFieldRef, setCreateTagValue, selectedItems } =
    useTreeContext();
  const { handleContextMenu, item } = useTagTreeItemContext();
  const ref = useRef<HTMLDivElement>(null);
  const [hovering, hoverProps] = useHover();

  const ttText = item.isTag ? item.path : `category '${item.path}'`;
  const ancestors = item.familyTags.filter((tag) => tag.path !== item.path);

  const Icon = item.isTag ? StarFolderIcon : FolderIcon;
  const actions = [
    {
      label: `view ${item.isTag ? "tag" : "category"}`,
      icon: LaunchIcon,
      // action: () => {
      //   popups.info(sbqr, `view ${item.isTag ? "tag" : "category"}`);
      // },
      // link: `/`,
      link: item.tag ? `/tags/${item.tag.id}` : `/category/${item.path}`,
    },
  ];
  return (
    <StyledTreeItem
      {...hoverProps}
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
        // <Tooltip title={ttText} placement="right">
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          onContextMenu={handleContextMenu}
        >
          <TagChip
            tag={item[hovering ? "path" : "label"]}
            specialColor={!item.isTag}
          />
          <Stack
            direction="row"
            component={Paper}
            // elevation={1}
            variant="outlined"
            spacing={0.25}
            sx={{
              backgroundColor: "primary.200",
              backgroundImage: "primary.200",
              color: "black",
              alignItems: "center",
              px: 0.25,
            }}
          >
            <TextIcon fontSize="small" />
            <Divider orientation="vertical" flexItem />
            <Typography>
              <Typography fontSize="small" sx={{ px: 0.25 }}>
                {item.useCount}
              </Typography>
            </Typography>
          </Stack>
          <ButtonGroup aria-label="tag tree item action button group">
            {actions.map((action) => (
              // <Tooltip title={action.label} placement="bottom">
              <IconButton
                aria-label={action.label}
                // onClick={() => action?.action()}
                component={Link}
                to={action.link}
                disabled={!item.isTag}
              >
                {action.icon({
                  // fontSize: ".25rem",
                  sx: { fontSize: "1rem" },
                })}
              </IconButton>
              // </Tooltip>
            ))}
          </ButtonGroup>
          <ContextMenu />
        </Stack>
        // </Tooltip>
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
function useHover() {
  const [hovering, setHovering] = useState<boolean>(false);
  const onHoverProps = {
    onMouseEnter: () => setHovering(true),
    onMouseLeave: () => setHovering(false),
  };
  return [hovering, onHoverProps] as const;
}

export function TagChip({
  tag,
  specialColor = false,
  sx,
}: {
  tag: string;
  specialColor?: boolean;
  sx?: SxProps;
}) {
  const typeSx = {
    // wordWrap: "break-word",
    whiteSpace: "normal",
    py: 0.5,
    px: 1,
    borderRadius: 1,
  };
  // replace all SEPARATOR with SEPAR+ nowidthspace, keeping what is between
  const parts = getTagParts(tag);
  const wrapInParenIfContainsWhitespace = (str: string) => {
    return str.includes(" ") ? `(${str})` : str;
  };
  const tagSpecial = parts
    .map(wrapInParenIfContainsWhitespace)
    .join(SEPARATOR + "\u200B");
  // const tagSpecial = tag;
  return (
    <Typography
      sx={{
        bgcolor: `primary.${!specialColor ? "main" : "200"}`,
        color: "primary.contrastText",
        maxWidth: "100%",
        ...typeSx,
        ...sx,
      }}
    >
      {tagSpecial}
    </Typography>
  );
}
