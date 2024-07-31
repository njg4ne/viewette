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

import LoopIcon from "@mui/icons-material/Loop";

export default function ConvertCategoryToTagMenuItem() {
  const { closeContextMenu, item } = useTagTreeItemContext();
  const { loading, setLoading } = useLoadingContext();
  const { enqueueSnackbar: sbqr } = useSnackbar();
  const doConvert = async () => {
    if (loading || !signalReady(dbs)) return;
    setLoading(true);
    const newTag = item.path;
    const db: TaguetteDb = dbs.value;
    db.createTag(newTag)
      .then(
        (newTag: string) => (
          sbqr(`Created tag: '${newTag}'`, {
            variant: "success",
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "right",
            },
          }),
          setLoading(false)
        )
      )
      .catch((e: Error) => {
        sbqr(e, {
          variant: "error",
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "right",
          },
        });
        setLoading(false);
      });
  };

  return (
    <MenuItem
      onClick={(e: Event) => {
        doConvert();
        closeContextMenu();
      }}
    >
      <ListItemIcon>
        <LoopIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>Convert to tag</ListItemText>
    </MenuItem>
  );
}
