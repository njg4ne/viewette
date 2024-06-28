import { ContentCopy } from "@mui/icons-material";
import Popover from "@mui/material/Popover";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import { useTagTreeItemContext } from "./TagTreeItemContext";
import RenameIcon from "@mui/icons-material/DriveFileRenameOutline";
import SaveIcon from "@mui/icons-material/Save";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import RightArrowIcon from "@mui/icons-material/ArrowRightAlt";

import { useRef, useState, useCallback } from "preact/compat";
import Menu from "@mui/material/Menu";
import { useLoadingContext } from "../../../contexts/LoadingContext";
import * as popups from "../../../popups";
import { dbs, signalReady } from "../../../signals";
import { useSnackbar } from "notistack";
import { SEPARATOR, getTagParts } from "../utils";
import { useTreeContext } from "@minoru/react-dnd-treeview";
import { TagChip } from "../../TagChip";
import Typography from "@mui/material/Typography";
// const

function pathReplace(path: string, level: number, replacement: string): string {
  const parts = getTagParts(path);
  parts[level] = replacement;
  return parts.join(SEPARATOR);
}

export default function RenameMenuItem() {
  const { closeContextMenu, item } = useTagTreeItemContext();
  // const {} = useTreeContext();
  const anchorRef = useRef<HTMLDivElement>(null);
  const renameFieldRef = useRef<HTMLInputElement>(null);
  const [renamePrefix, setRenamePrefix] = useState<string>(item.label);
  const [open, setOpen] = useState(false);

  const { loading, setLoading } = useLoadingContext();
  const { enqueueSnackbar: sbqr } = useSnackbar();
  const rejectNewName =
    renamePrefix.trim() === item.label || renamePrefix.trim() === "";
  const doRename = async (e: SubmitEvent) => {
    e.preventDefault();
    if (loading || rejectNewName) return;
    const updates: Record<string, string> = {};
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
    const updateEntries: [number, string][] = Object.entries(updates).map(
      ([id, path]) => [Number(id), path]
    );
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
  const text = `Change "${item.label}" for ${item.familyTags.length} tag${plural}`;

  return (
    <>
      <MenuItem onClick={handleToggle} ref={anchorRef}>
        <ListItemIcon>
          <RenameIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>{text} </ListItemText>
      </MenuItem>
      <Popover
        anchorEl={anchorRef.current}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Stack direction="column">
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              px: 2,
              py: 1,
            }}
          >
            <Typography>Rename {item.familyTags.length} tags under </Typography>
            <TagChip tag={item.path} specialColor={!item.isTag} />
            <RightArrowIcon />
            {rejectNewName ? (
              <Typography>(No change)</Typography>
            ) : (
              <TagChip tag={pathReplace(item.path, item.level, renamePrefix)} />
            )}
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            component="form"
            onSubmit={doRename}
            sx={{ mx: 2, my: 1 }}
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
              sx={{ flexGrow: 1 }}
              name="renamedTag"
              disabled={loading}
            />
            <Divider
              orientation="vertical"
              flexItem
              sx={{ marginLeft: 2, marginRight: 1 }}
            />
            <IconButton
              aria-label="save new name"
              type="submit"
              color="primary"
              disabled={rejectNewName || loading}
            >
              <SaveIcon />
            </IconButton>
            {/* <Divider orientation="vertical" flexItem sx={{ ml: 1, mr: 2 }} /> */}
          </Stack>
        </Stack>
      </Popover>
    </>
  );
}
