import { ContentCopy } from "@mui/icons-material";
import { MenuItem, ListItemIcon, ListItemText, TextField } from "@mui/material";
import { useTagTreeItemContext } from "./TagTreeItemContext";
import RenameIcon from "@mui/icons-material/DriveFileRenameOutline";
import SaveIcon from "@mui/icons-material/Save";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";

import { useRef, useState } from "react";
import Menu from "@mui/material/Menu";
import { useLoadingContext } from "../../../contexts/LoadingContext";
import * as popups from "../../../popups";
import { dbs, signalReady } from "../../../signals";
import { useSnackbar } from "notistack";
import { SEPARATOR } from "../utils";
import { useTreeContext } from "@minoru/react-dnd-treeview";
// const

export default function RenameMenuItem() {
  const { closeContextMenu, item } = useTagTreeItemContext();
  const {} = useTreeContext();
  const anchorRef = useRef<HTMLDivElement>(null);
  const renameFieldRef = useRef<HTMLInputElement>(null);
  const [renamePrefix, setRenamePrefix] = useState<string>(item.label);
  const [open, setOpen] = useState(false);

  const { loading, setLoading } = useLoadingContext();
  const { enqueueSnackbar: sbqr } = useSnackbar();
  const doRename = async (e: SubmitEvent) => {
    e.preventDefault();
    if (loading) return;
    const updates: Record<string, string> = {};
    if (renamePrefix === item.label) {
      popups.info(sbqr, "No change detected");
      closeContextMenu();
      return;
    }
    for (const tag of item.familyTags) {
      const parts = tag.path.split(SEPARATOR);
      console.log(
        tag.path,
        "replacing",
        parts.at(item.level),
        "with",
        renamePrefix
      );
      // parts[i] = renamePrefix;
      parts[item.level] = renamePrefix;
      const id = String(tag.id);
      updates[id] = parts.join(SEPARATOR);
    }
    const updateEntries = Object.entries(updates);
    for (const [id, path] of updateEntries) {
      console.log(`Renaming tag ${id} to ${path}`);
    }
    try {
      setLoading(true);
      const num = await dbs.value?.update.tags.byId(updateEntries);
      // throw "Not implemented";
      if (num > 0) {
        let msg: string;
        if (num === 1) {
          msg = `Renamed ${num} tag`;
        } else {
          msg = `Renamed ${num} tags`;
        }
        popups.success(sbqr, msg);
      }
    } catch (e) {
      console.error(e);
      popups.error(sbqr, `Failed to rename tags`);
    } finally {
      setLoading(false);
      closeContextMenu();
    }
  };
  const handleToggle = () => {
    setOpen((prevOpen) => {
      if (!prevOpen) {
        setTimeout(() => renameFieldRef.current?.focus(), 0);
      }
      return !prevOpen;
    });
  };
  const onChangeInput = (e: Event) => {
    setRenamePrefix((e.target as HTMLInputElement).value);
  };
  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setOpen(false);
  };

  const plural = item.familyTags.length > 1 ? "s" : "";
  const text = `Rename ${item.familyTags.length} "${item.label}" tag${plural}`;
  return (
    <>
      <MenuItem onClick={handleToggle} ref={anchorRef}>
        <ListItemIcon>
          <RenameIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{text} </ListItemText>
      </MenuItem>
      <Menu
        anchorEl={anchorRef.current}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "lock-button",
          role: "listbox",
        }}
        // component="form"
        // onSubmit={doRename}
      >
        <Stack
          direction="row"
          alignItems="center"
          component="form"
          onSubmit={doRename}
          sx={{ mx: 1 }}
          // spacing={2}
        >
          <TextField
            id="standard-basic"
            label="Rename"
            variant="standard"
            inputRef={renameFieldRef}
            value={renamePrefix}
            onChange={onChangeInput}
            placeholder={item.label}
            inputProps={{ "aria-label": `rename ${item.label} tags` }}
            // sx={{ mx: 2, my: 1 }}
            name="renamedTag"
            disabled={loading}
          />
          <Divider
            orientation="vertical"
            flexItem
            sx={{ marginLeft: 2, marginRight: 1 }}
          />
          <IconButton aria-label="save new name" type="submit" color="primary">
            <SaveIcon />
          </IconButton>
        </Stack>
      </Menu>
    </>
  );
}
