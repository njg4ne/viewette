import Stack from "@mui/material/Stack";
import { enqueueSnackbar, useSnackbar } from "notistack";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState, useRef } from "react";
// import { opfsDb } from "../../../signals";
// import { db } from "../../../db/models/TaguetteDb";
import Divider from "@mui/material/Divider";
import popup, * as popups from "../../../popups";

import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import TrashXIcon from "@mui/icons-material/DeleteForever";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Typography from "@mui/material/Typography";
import ChildIcon from "@mui/icons-material/SubdirectoryArrowRight";
import FolderIcon from "@mui/icons-material/Folder";
import StarFolderIcon from "@mui/icons-material/FolderSpecial";
import TagIcon from "@mui/icons-material/Sell";

import { dbs, signalReady } from "../../../signals";

import { useLoadingContext } from "../../../contexts/LoadingContext";
import { useTreeContext } from "../../../contexts/TagTreeContext";
import { useTagTreeItemContext } from "./TagTreeItemContext";
import { SEPARATOR } from "../utils";
import StyledTreeItem from "./StyledTreeItem";
import RenderMultipleTagTreeItems from "./MultipleTagTreeItems";
import DeleteMenuItems from "./DeleteMenuItems";
import RenameMenuItem from "./RenameMenuItem";

export { ContextMenu };
export default ContextMenu;
function ContextMenu() {
  const { item, closeContextMenu, handleContextMenu, contextMenuPosition } =
    useTagTreeItemContext();
  const { createTagFieldRef, setCreateTagValue, selectedItems } =
    useTreeContext();
  const { enqueueSnackbar: sbqr } = useSnackbar();
  const Icon = item.isTag ? TagIcon : FolderIcon;
  return (
    <Menu
      open={contextMenuPosition !== null}
      onClose={closeContextMenu}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenuPosition !== null
          ? {
              top: contextMenuPosition.mouseY,
              left: contextMenuPosition.mouseX,
            }
          : undefined
      }
    >
      <MenuItem
        sx={{
          pointerEvents: "none",
        }}
      >
        <ListItemIcon>
          {/* <TagIcon fontSize="small" />
           */}
          <Icon fontSize="small" />
        </ListItemIcon>
        <ListItemText>
          <Typography
            variant="inherit"
            sx={{
              wordWrap: "break-word",
              whiteSpace: "normal",
              maxWidth: "100%",
              width: "fit-content",
            }}
          >
            {!item.isTag ? "Category: " : null}
            {item.path}
          </Typography>
        </ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem
        onClick={(e: Event) => {
          navigator.clipboard.writeText(item.path);
          closeContextMenu();
        }}
      >
        <ListItemIcon>
          <ContentCopy fontSize="small" />
        </ListItemIcon>
        <ListItemText>Copy ID</ListItemText>
      </MenuItem>
      {/* <MenuItem onClick={deleteTag}>
       <ListItemIcon>
         <TrashXIcon fontSize="small" />
       </ListItemIcon>
       <ListItemText>Delete All</ListItemText>
      </MenuItem> */}
      <MenuItem
        onClick={() => {
          closeContextMenu();
          const ref = createTagFieldRef.current;

          if (ref) {
            console.log(ref);
            // setCreateTagValue(label); // do again after a second
            // Race Condition
            setTimeout(() => {
              setCreateTagValue(item.path + SEPARATOR);
              createTagFieldRef?.current?.focus();
            }, 100);
          }
        }}
      >
        <ListItemIcon>
          <ChildIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Create subtag</ListItemText>
      </MenuItem>
      <DeleteMenuItems />
      <RenameMenuItem />
    </Menu>
  );
}

function DeleteSelectedMenuItem(label: string) {
  const { selectedItems } = useTreeContext();
  const { loading, setLoading } = useLoadingContext();
  const { enqueueSnackbar: sbqr } = useSnackbar();

  const { closeContextMenu } = useTagTreeItemContext();
  const isSelected = (id: string) => selectedItems.includes(id);

  const deleteTags = async (paths: string[]) => {
    if (loading || !signalReady(dbs)) return;
    try {
      setLoading(true);
      const db = dbs.value;
      const num = await db.delete.tags.byExactPaths(paths);
      popups.success(sbqr, `Deleted ${num} tags`);
    } catch (e) {
      console.error(e);
      popups.error(sbqr, `Failed to delete tags`);
    } finally {
      setLoading(false);
      closeContextMenu();
    }
  };
  return !isSelected(label) ? null : (
    <MenuItem onClick={() => deleteTags(selectedItems)}>
      <ListItemIcon>
        <TrashXIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>
        Delete {selectedItems.length || 0}-ish Selected
      </ListItemText>
    </MenuItem>
  );
}

// const deleteRecursively = (_e: Event) => {
//   if (loading) return;
//   setLoading(true);
//   opfsDb.value
//     ?.deleteTag(partialPath)
//     .then((deleted: any[]) => {
//       const n = deleted?.length || 0;
//       enqueueSnackbar(
//         `Deleted ${n} tag${n > 1 ? "s" : ""} '${partialPath}' tags`,
//         {
//           variant: "info",
//           anchorOrigin: {
//             vertical: "bottom",
//             horizontal: "right",
//           },
//         }
//       );
//       // console.log(deleted);
//       setLoading(false);
//       closeContextMenu();
//     })
//     .catch((e: Error) => {
//       console.error(e);
//       setLoading(false);
//       closeContextMenu();
//     });
// };
