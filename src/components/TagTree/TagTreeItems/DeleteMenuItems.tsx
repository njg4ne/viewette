import * as React from "preact/compat";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Menu from "@mui/material/Menu";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import TrashXIcon from "@mui/icons-material/DeleteForever";
import { useTreeContext } from "../../../contexts/TagTreeContext";
import { getGenealogy } from "../utils";
import { useLoadingContext } from "../../../contexts/LoadingContext";
import { useSnackbar } from "notistack";
import { useTagTreeItemContext } from "./TagTreeItemContext";
import { dbs, signalReady } from "../../../signals";
// import { db } from "../../../db/models/TaguetteDb";
import * as popups from "../../../popups";
// const options = ["...", "Squash and merge", "Rebase and merge"];

export default function DeleteMenuItems() {
  const { numTagsSelected, tags, selectedItems } = useTreeContext();
  const { item, closeContextMenu } = useTagTreeItemContext();
  // const numInFamily = item.familyTags.length;
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  // const family = getGenealogy([label], tags);
  const numInFamily = item.familyTags.length;
  // const tagsInFamily = numInFamily - (!item.isTag ? 1 : 0);
  const familyIsOnlySelection =
    item.familyTags.length === numTagsSelected &&
    item.familyTags.every((tag) => selectedItems.includes(tag.path));
  const options: string[] = [];
  // const actions: Function[] = [];
  const targets: string[] = [];
  const { loading, setLoading } = useLoadingContext();
  const { enqueueSnackbar: sbqr } = useSnackbar();

  // const {  } = useTagTreeItemContext();

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

  const isSelected = (path: string) => selectedItems.includes(path);
  // if (isSelected(item.path)) {
  //   let selectedText;
  //   if (numTagsSelected === 1) {
  //     if (item.isTag) {
  //       selectedText = numInFamily === 1 ? " (selected)" : "";
  //       options.push(`Only "${item.path}"${selectedText}`);
  //       targets.push("self");
  //     }

  //     if (numInFamily > 1) {
  //       const allText = numInFamily === 2 ? "" : "All ";

  //       const pluralText = numInFamily === 2 ? "" : "s";
  //       options.push(
  //         `${allText}${item.familyTags.length} "${item.path}" tag${pluralText}`
  //       );
  //       targets.push("family");
  //     }
  //   } else {
  //     if (item.isTag) {
  //       options.push(`Only "${item.path}"`);
  //       targets.push("self");
  //     }
  //     if (numInFamily > 1) {
  //       selectedText = familyIsOnlySelection ? " selected" : "";
  //       const allText = numInFamily === 2 ? "" : "All ";
  //       const pluralText = numInFamily === 2 ? "" : "s";
  //       options.push(
  //         `${allText}${item.familyTags.length}${selectedText} "${item.path}" tag${pluralText}`
  //       );
  //       targets.push("family");
  //     }
  //     if (!familyIsOnlySelection && numTagsSelected > 1) {
  //       options.push(`All ${numTagsSelected} selected`);
  //       targets.push("selected");
  //     }
  //   }
  // } else {
  //   if (item.isTag) {
  //     options.push(`Only "${item.path}"`);
  //     targets.push("self");
  //   }

  //   if (numInFamily > 1) {
  //     const allText = numInFamily === 2 ? "" : "All ";
  //     const pluralText = numInFamily === 2 ? "" : "s";
  //     options.push(
  //       `${allText}${item.familyTags.length} "${item.path}" tag${pluralText}`
  //     );
  //     targets.push("family");
  //   }
  // }
  if (item.isTag) {
    options.push(`Only "${item.path}"`);
    targets.push("self");
  }
  if (isSelected(item.path) && numTagsSelected > 1) {
    options.push(`${numTagsSelected} selected`);
    targets.push("selected");
  }
  options.push(`All ${item.familyTags.length} "${item.path}" tags`);
  targets.push("family");

  // console.log(actions.length, options.length, actions, options);

  // const handleClick = () => {
  //   actions[selectedIndex]();
  // };

  const handleMenuItemClick = (event: MouseEvent, index: number) => {
    // setSelectedIndex(index);
    // actions[selectedIndex]();
    switch (targets[index]) {
      case "self":
        deleteTags([item.path]);
        break;
      case "family":
        deleteTags(item.familyTags.map((tag) => tag.path) || []);
        break;
      case "selected":
        deleteTags(selectedItems);
        break;
    }
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
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

  return (
    <>
      <MenuItem onClick={handleToggle} ref={anchorRef}>
        <ListItemIcon>
          <TrashXIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Delete...</ListItemText>
      </MenuItem>
      <Menu
        id="delete-menu"
        anchorEl={anchorRef.current}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "lock-button",
          role: "listbox",
        }}
      >
        {options.map((option, index) => (
          <MenuItem
            key={option}
            // selected={index === selectedIndex}
            onClick={(event: MouseEvent) => handleMenuItemClick(event, index)}
          >
            <ListItemIcon>
              <TrashXIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{option}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
