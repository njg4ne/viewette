import { ContentCopy, Merge } from "@mui/icons-material";
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
import { SEPARATOR } from "../utils";
import { useTreeContext } from "../../../contexts/TagTreeContext";
import { ManagedTagChooser } from "../../TagsFilter";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import { TagChip } from "./SingleTagTreeItem";
import { Typography } from "@mui/material";
import { TaguetteDb } from "../../../db";
// const

export default function MergeMenuItem() {
  const { closeContextMenu, item } = useTagTreeItemContext();
  const { allTags } = useTreeContext();
  const anchorRef = useRef<HTMLDivElement>(null);
  const renameFieldRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const { loading, setLoading } = useLoadingContext();
  const { enqueueSnackbar: sbqr } = useSnackbar();
  const initialTagEntry = [-1, ""] as [number, string];
  const otherTags = [[-1, ""]].concat(
    entrify(allTags.filter((tag) => tag.id !== item?.tag?.id))
  );
  // const otherTags = entrify(allTags);
  // const initialTagEntry =
  //   item.tag && item.tag.id !== undefined && item.tag.path !== undefined
  //     ? ([item.tag.id, item.tag.path] as [number, string])
  //     : null;

  const [mergeTarget, setMergeTarget] =
    useState<[number, string]>(initialTagEntry);
  const [confirm, setConfirm] = useState(false);

  const handleToggle = () => {
    setOpen((prevOpen) => {
      if (!prevOpen) {
        setTimeout(() => renameFieldRef.current?.focus(), 0);
      }
      return !prevOpen;
    });
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
  // const text = `Merge ${item.familyTags.length} "${item.label}" tag${plural} into...`;
  const text = "Merge into...";
  const subWidth = anchorRef.current?.offsetWidth || "auto";
  const onAutocompleteChange = (event: Event, newValue: [number, string]) => {
    if (newValue === null) {
      newValue = initialTagEntry;
    }
    const [id, path] = newValue;
    setMergeTarget(newValue);
  };
  function catchReset(event: Event, value: string, reason: string): void {
    if (reason === "clear") {
      setConfirm(false);
    }
  }
  const defaultOptionInUse = ((mergeTarget?.at(0) || -1) as number) < 0;
  const disableMerge = defaultOptionInUse || !confirm;

  const doMerge = async (e: SubmitEvent) => {
    e.preventDefault();
    if (loading || !signalReady(dbs) || disableMerge || !item.tag) return;
    try {
      setLoading(true);
      const db: TaguetteDb = dbs.value;

      const num = await merge(
        dbs.value,
        item.tag.id,
        mergeTarget!.at(0)! as number
      );
      let msg: string;
      if (num > 0) {
        msg = `Merge caused ${num} changes`;
        popups.success(sbqr, msg);
      } else {
        msg = `Merge caused no changes`;
        popups.info(sbqr, msg);
      }
    } catch (e) {
      console.error(e);
      popups.error(sbqr, `Failed to rename tags`);
    } finally {
      setLoading(false);
      closeContextMenu();
    }
  };

  return (
    <>
      <MenuItem onClick={handleToggle} ref={anchorRef}>
        <ListItemIcon>
          <MergeIcon fontSize="small" />
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

        // MenuListProps={{
        //   "aria-labelledby": "lock-button",
        //   role: "listbox",
        // }}
        // component="form"
        // onSubmit={doRename}
      >
        <Stack
          direction="row"
          alignItems="center"
          component="form"
          onSubmit={doMerge}
          sx={{
            minWidth: subWidth,
            p: 2,
            pb: 1,
            // width: subWidth !== "auto" ? 1.5 * subWidth : "auto",
          }}
          flexWrap="wrap"
          justifyContent="center"
          gap={1}
          // spacing={1}
          // sx={{ px: 1 }}
          // spacing={2}
        >
          <Typography>Merge</Typography>
          <TagChip tag={item.tag?.path || ""} />
          <RightArrowIcon />
          {defaultOptionInUse ? (
            <Typography>(No target chosen)</Typography>
          ) : (
            <TagChip tag={mergeTarget[1]} />
          )}
          <ManagedTagChooser
            onInputChange={catchReset}
            multiple={false}
            options={otherTags}
            fullWidth
            defaultValue={[]}
            value={mergeTarget}
            onChange={onAutocompleteChange}
            // value={[...toAdd].map((num) => num.toString())}
            // value={newTags.value}
            disabled={loading}
          />
          {/* <Divider orientation="vertical" flexItem /> */}
          <Box sx={{ pl: 1 }}>
            <FormControlLabel
              // labelPlacement="start"
              label="Confirm "
              control={
                <Checkbox
                  checked={confirm}
                  onChange={() => setConfirm(!confirm)}
                />
              }
            />
          </Box>
          {/* <Divider orientation="vertical" flexItem /> */}
          <Button
            disabled={disableMerge}
            variant="contained"
            endIcon={<MergeIcon />}
            type="submit"
            aria-label="merge tags"
          >
            Merge
          </Button>
          {/* <Divider orientation="vertical" flexItem /> */}
        </Stack>
      </Popover>
    </>
  );
}

async function merge(db: TaguetteDb, $otid: number, $ntid: number) {
  let bindings: any = { $ntid, $otid };
  // highlight_tags might contain a row with tag_id = $otid, a row with tag_id = $ntid,
  // neither, or both. If it contains both, we should delete the row with tag_id = $otid.
  // if it contains only the row with tag_id = $otid, we should update that row to have
  // tag_id = $ntid instead.
  const maybeDeleteSql = `DELETE FROM highlight_tags WHERE tag_id = $otid AND highlight_id IN (SELECT highlight_id FROM highlight_tags WHERE tag_id = $ntid);`;
  const [rows] = await db.transactAll([{ sql: maybeDeleteSql, bindings }]);
  const changesSql = `SELECT changes() as changes;`;
  const changes = await db.exec(changesSql);
  let numChanges: number = 0;
  numChanges += (changes?.result?.resultRows?.at(0) as number) | 0;
  const maybeUpdateSql = `UPDATE highlight_tags SET tag_id = $ntid WHERE tag_id = $otid;`;
  const [rows2] = await db.transactAll([{ sql: maybeUpdateSql, bindings }]);
  const changes2 = await db.exec(changesSql);
  numChanges += (changes2?.result?.resultRows?.at(0) as number) | 0;
  // finally delete the tag itself
  bindings = { $otid };
  const deleteTagSql = `DELETE FROM tags WHERE id = $otid;`;
  const [rows3] = await db.transactAll([{ sql: deleteTagSql, bindings }]);
  const changes3 = await db.exec(changesSql);
  numChanges += (changes3?.result?.resultRows?.at(0) as number) | 0;

  return numChanges;
}
