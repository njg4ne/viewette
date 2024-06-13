import { ContentCopy, Merge } from "@mui/icons-material";
import TextField from "@mui/material/TextField";
import RenameIcon from "@mui/icons-material/DriveFileRenameOutline";

import { useCallback } from "preact/compat";
// import { MenuItem, ListItemIcon, ListItemText, TextField } from "@mui/material";
import Popover from "@mui/material/Popover";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useTagTreeItemContext } from "./TagTreeItemContext";
import MergeIcon from "@mui/icons-material/Merge";
import Checkbox from "@mui/material/Checkbox";
import SaveIcon from "@mui/icons-material/Save";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import { entrify } from "../../EditHighlight/EditHighlight";
import RightArrowIcon from "@mui/icons-material/ArrowRightAlt";
// import type { SyntheticEvent } from "preact/compat";

import { useRef, useState } from "preact/compat";
import Menu from "@mui/material/Menu";
import { useLoadingContext } from "../../../contexts/LoadingContext";
import * as popups from "../../../popups";
import { dbs, signalReady } from "../../../signals";
import { useSnackbar } from "notistack";
import { SEPARATOR, getTagParts } from "../utils";
import { useTreeContext } from "../../../contexts/TagTreeContext";
import { ManagedTagChooser } from "../../TagsFilter";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import { TagChip } from "../../TagChip";
import { Typography } from "@mui/material";
import { TaguetteDb } from "../../../db";
import { mergeMany } from "./MergeMenuItem";
// const

export default function RedefineMenuItem() {
  const { closeContextMenu, item } = useTagTreeItemContext();
  const {} = useTreeContext();
  const anchorRef = useRef<HTMLDivElement>(null);
  const renameFieldRef = useRef<HTMLInputElement>(null);
  const [renamePrefix, setRenamePrefix] = useState<string>(item.path);
  const [open, setOpen] = useState(false);

  const { loading, setLoading } = useLoadingContext();
  const { enqueueSnackbar: sbqr } = useSnackbar();
  const rejectNewName =
    renamePrefix.trim() === item.path || renamePrefix.trim() === "";
  const doRedefine = async (e: SubmitEvent) => {
    e.preventDefault();
    if (loading || !signalReady(dbs) || rejectNewName) return;
    const db: TaguetteDb = dbs.value;
    const fam = item.familyTags;
    const targetPath = renamePrefix.trim();
    const updateEntries = fam.map((t) => {
      const parts = getTagParts(t.path);
      const tail = parts.slice(item.level + 1);
      const newPath = [targetPath, ...tail].join(SEPARATOR);
      const res = {
        id: t.id,
        oldPath: t.path,
        newPath,
      };
      console.log(res);
      return res;
    });
    try {
      setLoading(true);
      const numChanges = await mergeMany(db, updateEntries);
      let msg: string = `Merge caused ${numChanges} changes`;
      popups.success(sbqr, msg);
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
  const text = `Redefine ${item.familyTags.length} "${item.label}" tag${plural}`;

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
            <Typography>
              Redefine {item.familyTags.length} tags under{" "}
            </Typography>
            <TagChip tag={item.path} specialColor={!item.isTag} />
            <RightArrowIcon />
            {rejectNewName ? (
              <Typography>(No change)</Typography>
            ) : (
              <TagChip tag={renamePrefix} />
            )}
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            component="form"
            onSubmit={doRedefine}
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
              placeholder={item.path}
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
