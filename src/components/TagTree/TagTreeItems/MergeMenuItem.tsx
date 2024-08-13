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
import { TagTreeItem } from "./MultipleTagTreeItems";
// const

export default function MergeMenuItem() {
  const { closeContextMenu, item } = useTagTreeItemContext();
  const { allTagsUnfiltered } = useTreeContext();
  const anchorRef = useRef<HTMLDivElement>(null);
  const renameFieldRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const { loading, setLoading } = useLoadingContext();
  const { enqueueSnackbar: sbqr } = useSnackbar();
  const initialTagEntry = [-1, ""] as [number, string];
  const otherTags = [[-1, ""]].concat(
    entrify(allTagsUnfiltered.filter((tag) => tag.id !== item?.tag?.id))
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
    setConfirm(false);
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
    if (loading || !signalReady(dbs) || disableMerge) return;
    try {
      setLoading(true);
      // console.log("loading set true");
      // const wait500 = new Promise((resolve) => setTimeout(resolve, 500));
      // await wait500;
      const db: TaguetteDb = dbs.value;
      const [, targetPath] = mergeTarget;
      const fam = item.familyTags;
      const updateEntries = fam.map((t) => {
        const parts = getTagParts(t.path);
        const tail = parts.slice(item.level + 1);
        const newPath = [targetPath, ...tail].join(SEPARATOR);
        const res = {
          id: t.id,
          oldPath: t.path,
          newPath,
        };
        return res;
      });
      const numChanges = await mergeMany(db, updateEntries);
      let msg: string = `Merge caused ${numChanges} changes`;
      popups.success(sbqr, msg);
    } catch (e) {
      console.error(e);
      popups.error(sbqr, `Failed to merge tags`);
    } finally {
      setLoading(false);
      // console.log("loading set false");
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
        {/* @ts-ignore */}
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
          <Typography>Merge {item.familyTags.length} x</Typography>
          <TagChip tag={item.path} specialColor={!item.isTag} />
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

async function _mergeOne(db: TaguetteDb, $otid: number, $ntid: number) {
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

export type UpdatePacket = {
  id: number;
  oldPath: string;
  newPath: string;
};
export async function mergeMany(db: TaguetteDb, updatePackets: UpdatePacket[]) {
  // step 1: delete any highlight_tags rows where the hl already has a tag with the new path... we dont actually need to do this, because when we delete the old tag, the delete will cascade as long as the PRAGMA foreign_keys = ON is set
  // step 2: we need to create any of the new tags that don't already exist
  let totalChanges = 0;
  let sql = `INSERT OR IGNORE INTO tags (path, description, project_id) VALUES `;
  function insertOne(
    packet: UpdatePacket,
    bindings: Record<string, any>,
    index: number
  ): [string, Record<string, any>] {
    const { id, newPath } = packet;
    const pathKey = `$path${index}`;
    const descKey = `$descId${index}`;
    bindings = Object.assign(bindings, {
      [pathKey]: newPath,
      [descKey]: id,
    });
    return [
      `(${pathKey}, (SELECT description FROM tags WHERE id = ${descKey}), (SELECT projects.id FROM projects LIMIT 1))`,
      bindings,
    ];
  }
  let bindings: Record<string, any> = {};
  const pathKeys = updatePackets.map((packet, i) => {
    let pathKey;
    [pathKey, bindings] = insertOne(packet, bindings, i);
    return pathKey;
  });
  const valuesSql = pathKeys.join(",");
  sql += `${valuesSql};`;
  // console.log("sql", sql);
  // console.log("bindings", bindings);
  let [rows, [changesRow]] = await db.transactAll([
    { sql, bindings },
    { sql: "SELECT changes() as changes;" },
  ]);

  // console.log("num changes:", changesRow?.changes);
  totalChanges += (changesRow?.changes as number) | 0;

  function createWhenThen(
    packet: UpdatePacket,
    bindings: Record<string, any>,
    index: number
  ): [string, Record<string, any>] {
    const { id, oldPath, newPath } = packet;
    const otidKey = `$otid${index}`;
    const newPathKey = `$newPath${index}`;
    bindings = Object.assign(bindings, {
      [otidKey]: id,
      [newPathKey]: newPath,
    });
    const whenThen = `WHEN tag_id = ${otidKey} THEN ${newPathKey}`;
    return [whenThen, bindings];
  }
  sql = `UPDATE OR IGNORE highlight_tags SET tag_id = (SELECT id FROM tags WHERE path = CASE `;
  bindings = {};
  const whenThens = updatePackets.map((packet, i) => {
    let whenThen;
    [whenThen, bindings] = createWhenThen(packet, bindings, i);
    return whenThen;
  });
  const whenThenSql = whenThens.join(" ");
  sql += `${whenThenSql} END) WHERE tag_id IN (`;
  function createValue(
    updatePackets: UpdatePacket[],
    bindings: Record<string, any>
  ): [string, Record<string, any>] {
    const tagIds = updatePackets.map((packet, index) => {
      const tagIdKey = `$oldTagId${index}`;
      bindings[tagIdKey] = packet.id;
      return tagIdKey;
    });
    const inClause = tagIds.join(", ");
    return [inClause, bindings];
  }
  let values;
  [values, bindings] = createValue(updatePackets, bindings);
  sql += `${values});`;
  //console.log("sql", sql);
  //console.log("bindings", bindings);
  const [rows2, [changesRow2]] = await db.transactAll([
    { sql, bindings },
    { sql: "SELECT changes() as changes;" },
  ]);
  //console.log("num changes:", changesRow2?.changes);
  totalChanges += (changesRow2?.changes as number) | 0;
  // { sql: "PRAGMA foreign_keys = ON;" },
  // finally, delete the old tags
  bindings = {};
  [values, bindings] = createValue(updatePackets, bindings);
  const deleteSql = `DELETE FROM tags WHERE id IN (${values});`;
  const [, rows3, [changesRow3], rows4] = await db.transactAll([
    { sql: "PRAGMA foreign_keys = ON;" },
    { sql: deleteSql, bindings },
    { sql: "SELECT changes() as changes;" },
    { sql: "SELECT path FROM tags;" },
  ]);
  //console.log("num changes:", changesRow3?.changes);
  totalChanges += (changesRow3?.changes as number) | 0;
  //console.log("total changes:", totalChanges);
  //console.log("tags left:", ...rows4);
  return totalChanges;
}

export async function persistMerge(
  db: TaguetteDb,
  srcItem: TagTreeItem,
  targetPath: string
) {
  const updateEntries = srcItem.familyTags.map((t) => {
    const parts = getTagParts(t.path);
    const tail = parts.slice(srcItem.level + 1);
    const newPath = [targetPath, ...tail].join(SEPARATOR);
    const res = {
      id: t.id,
      oldPath: t.path,
      newPath,
    };
    return res;
  });
  // console.log("updateEntries", updateEntries);
  const numChanges = await mergeMany(db, updateEntries);
  return numChanges;
}

export async function persistNest(
  db: TaguetteDb,
  srcItem: TagTreeItem,
  targetPath: string
) {
  const updateEntries = srcItem.familyTags.map((t) => {
    const parts = getTagParts(t.path);
    const tail = parts.slice(srcItem.level);
    const newPath = [targetPath, ...tail].join(SEPARATOR);
    const res = {
      id: t.id,
      oldPath: t.path,
      newPath,
    };
    return res;
  });
  const numChanges = await mergeMany(db, updateEntries);
  return numChanges;
}
