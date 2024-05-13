import { useState, useEffect } from "preact/hooks";
import { FC } from "preact/compat";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import Card from "@mui/material/Card";
type PropTypes = {
  options: (string | number)[][]; // tag entry?
  onCheck: (checked: boolean, id: number) => void;
  disabled: boolean;
};
export const ExistingTagsEditor: FC<PropTypes> = ({
  options,
  onCheck,
  disabled,
}) => {
  const [checked, setChecked] = useState<number[]>([0]);
  //   useEffect(() => {
  //     console.log("options", options);
  //   }, [options]);

  return (
    <List component={Card} sx={{ width: "75%" }}>
      {options.map(([tid, tagName]) => {
        const labelId = `checkbox-list-label-${tid}`;

        return (
          <ListItem key={tid} disablePadding>
            <ListItemButton
              role={undefined}
              onClick={(e: any) =>
                onCheck(e?.target?.checked || false, Number(tid))
              }
              dense
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  // checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ "aria-labelledby": labelId }}
                  defaultChecked
                  disabled={disabled}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={`${tagName}`} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};
export default ExistingTagsEditor;
