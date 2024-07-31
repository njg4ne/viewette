import ListItemIcon from "@mui/material/ListItemIcon";
import MenuItem from "@mui/material/MenuItem";
import LeftArrowIcon from "@mui/icons-material/West";
import ListItemText from "@mui/material/ListItemText";
import { useTagTreeItemContext } from "./TagTreeItemContext";
import { useSnackbar } from "notistack";
import { useLoadingContext } from "../../../contexts/LoadingContext";
import { TaguetteDb } from "../../../db";
import * as popups from "../../../popups";
import { signalReady, dbs } from "../../../signals";
import { getTagParts, SEPARATOR } from "../utils";
import { mergeMany } from "./MergeMenuItem";

export default function PromoteMenuItem() {
  const { closeContextMenu, item } = useTagTreeItemContext();
  const { loading, setLoading } = useLoadingContext();
  const { enqueueSnackbar: sbqr } = useSnackbar();
  const doPromote = async () => {
    if (loading || !signalReady(dbs)) return;
    const db: TaguetteDb = dbs.value;
    const fam = item.familyTags;
    //goal is to cut out what is directly left of the label from all tags
    const parts = getTagParts(item.path);
    const firstPart = parts[0];
    // if first part is last part, do nothing and pop up error that the tag is already at the top level
    if (parts.length === 1) {
      popups.error(sbqr, `Tag is already at top level`);
      return;
    }
    const leftOfLabelPart = parts.at(item.level - 1);
    if (!leftOfLabelPart) {
      popups.error(sbqr, `Failed to find parent tag`);
      return;
    }
    popups.info(sbqr, `Dropping ${leftOfLabelPart} from ${item.path}`);
    const head = parts.slice(0, parts.indexOf(leftOfLabelPart));
    const tail = parts.slice(parts.indexOf(leftOfLabelPart) + 1);
    const newItemPath = [...head, ...tail].join(SEPARATOR);
    const updateEntries = fam.map((t) => {
      const newPath = t.path.replace(item.path, newItemPath);
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
  return (
    <MenuItem
      onClick={(e: Event) => {
        doPromote();
        closeContextMenu();
      }}
    >
      <ListItemIcon>
        <LeftArrowIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>Promote 1 level</ListItemText>
    </MenuItem>
  );
}
