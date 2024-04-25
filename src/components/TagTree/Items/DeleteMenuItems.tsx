import * as React from "react";
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
import { useTreeContext } from "../contexts/Tree";
import { getGenealogy } from "../utils";
import { useLoadingContext } from "../contexts/Loading";
import { useSnackbar } from "notistack";
import { useTagTreeItemContext } from "./Context";
import { opfsDb } from "../../../signals";
import * as popups from "../../../popups";
// const options = ["...", "Squash and merge", "Rebase and merge"];

export default function DeleteMenuItems({
  isTag,
  label,
}: {
  isTag: boolean;
  label: string;
}) {
  const { numTagsSelected, tags, selectedItems } = useTreeContext();

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const family = getGenealogy([label], tags);
  const numInFamily = family.length;
  const tagsInFamily = numInFamily - (!isTag ? 1 : 0);
  const familyIsOnlySelection =
    family.length === numTagsSelected &&
    family.every((path) => selectedItems.includes(path));
  const options: string[] = [];
  // const actions: Function[] = [];
  const targets: string[] = [];
  const { loading, setLoading } = useLoadingContext();
  const { enqueueSnackbar: sbqr } = useSnackbar();

  const { closeContextMenu } = useTagTreeItemContext();

  const deleteTags = async (paths: string[]) => {
    if (loading) return;
    try {
      setLoading(true);
      const num = await opfsDb.value?.delete.tags.byExactPaths(paths);
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
  if (isSelected(label)) {
    let selectedText;
    if (numTagsSelected === 1) {
      if (isTag) {
        selectedText = numInFamily === 1 ? " (selected)" : "";
        options.push(`Only "${label}"${selectedText}`);
        targets.push("self");
      }

      if (numInFamily > 1) {
        const allText = numInFamily === 2 ? "" : "All ";

        const pluralText = numInFamily === 2 ? "" : "s";
        options.push(`${allText}${tagsInFamily} "${label}" tag${pluralText}`);
        targets.push("family");
      }
    } else {
      if (isTag) {
        options.push(`Only "${label}"`);
        targets.push("self");
      }
      if (numInFamily > 1) {
        selectedText = familyIsOnlySelection ? " selected" : "";
        const allText = numInFamily === 2 ? "" : "All ";
        const pluralText = numInFamily === 2 ? "" : "s";
        options.push(
          `${allText}${tagsInFamily}${selectedText} "${label}" tag${pluralText}`
        );
        targets.push("family");
      }
      if (!familyIsOnlySelection && numTagsSelected > 1) {
        options.push(`All ${numTagsSelected} selected`);
        targets.push("selected");
      }
    }
  } else {
    if (isTag) {
      options.push(`Only "${label}"`);
      targets.push("self");
    }

    if (numInFamily > 1) {
      const allText = numInFamily === 2 ? "" : "All ";
      const pluralText = numInFamily === 2 ? "" : "s";
      options.push(`${allText}${tagsInFamily} "${label}" tag${pluralText}`);
      targets.push("family");
    }
  }
  // console.log(actions.length, options.length, actions, options);

  // const handleClick = () => {
  //   actions[selectedIndex]();
  // };

  const handleMenuItemClick = (event: MouseEvent, index: number) => {
    // setSelectedIndex(index);
    // actions[selectedIndex]();
    switch (targets[index]) {
      case "self":
        deleteTags([label]);
        break;
      case "family":
        deleteTags(family);
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
        id="lock-menu"
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
