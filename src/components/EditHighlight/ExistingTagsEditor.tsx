import { useState, useEffect, useRef } from "preact/hooks";
import { FC } from "preact/compat";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import Card from "@mui/material/Card";
import { TagChip } from "../TagChip";
type PropTypes = {
  options: (string | number)[][]; // tag entry?
  onCheck: (checked: boolean, id: number) => void;
  disabled: boolean;
  toRemove: Set<number>;
};
export const ExistingTagsEditor: FC<PropTypes> = ({
  options,
  onCheck,
  disabled,
  toRemove,
}) => {
  return (
    <List component={Card} sx={{ width: "75%" }}>
      {options.map(([tid, tagName]) => {
        const labelId = `checkbox-list-label-${tid}`;
        const checked = !toRemove.has(Number(tid));
        const toggle = () => onCheck(!checked, Number(tid));
        return (
          <ListItem key={tid} disablePadding>
            <ListItemButton role={undefined} onClick={toggle} dense>
              <ListItemIcon>
                <Checkbox
                  color="secondary"
                  checked={checked}
                  edge="start"
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ "aria-labelledby": labelId }}
                  defaultChecked
                  disabled={disabled}
                />
              </ListItemIcon>
              <TagChip
                tag={tagName.toString()}
                sx={{ textDecoration: !checked ? "line-through" : "none" }}
              />
              {/* <ListItemText id={labelId} primary={`${tagName}`} /> */}
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};
export default ExistingTagsEditor;
