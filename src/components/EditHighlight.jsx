import React from "react";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { highlights, tags } from "../signals/Filesystems";
import { TagChooser } from "./TagsFilter";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";

function ChangeExistingTags({ options, onCheck }) {
    const [checked, setChecked] = React.useState([0]);

    return <List
        component={Card}
        sx={{ width: "75%" }}
    >
        {options.map(([tid, tagName]) => {
            const labelId = `checkbox-list-label-${tid}`;

            return (
                <ListItem
                    key={tagName}
                    // secondaryAction={
                    //     <IconButton edge="end" aria-label="comments">
                    //         <CommentIcon />
                    //     </IconButton>
                    // }
                    disablePadding
                >
                    <ListItemButton
                        role={undefined}
                        onClick={(e) => onCheck(e.target.checked, tid)}
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
                            />
                        </ListItemIcon>
                        <ListItemText id={labelId} primary={`${tagName}`} />
                    </ListItemButton>
                </ListItem>
            );
        })}
    </List>
}

export default function EditHighlight() {
    const { id } = useParams();
    const highlight = highlights.value?.find(h => h.id === Number(id));
    const snippet = highlight?.snippet;
    let tids = highlight?.tags;
    const tagEntries = Object.entries(tags.value).filter(([tid, _]) => !tids.includes(Number(tid)));
    tids = tids || [];
    tids = tids.map(tid => [`${tid}`, tags.value[tid]]);
    const hlTags = tids.map(tid => tags[tid]);

    console.log("tids", tids);
    const [toRemove, setToRemove] = React.useState(new Set());
    const [toAdd, setToAdd] = React.useState(new Set());

    const onChange = (event, value) => {
        console.log("onChange", value);
        // setToAdd((s) => {
        //     value.map(v => Number(v[0])).forEach((v) => s.add(v));
        //     return new Set(s);
        // });
    };
    const onCheck = (checked, id) => {
        console.log("onCheck", checked, id)
        // setToRemove((s) => {
        //     if (checked) {
        //         s.delete(id);
        //     }
        //     else {
        //         s.add(id);
        //     }
        //     return new Set(s);
        // });
    };

    // use effect to both sets and console log them
    // React.useEffect(() => {
    //     console.log("toRemove", toRemove);
    //     console.log("toAdd", toAdd);
    // }, [toRemove, toAdd]);


    return <Stack alignItems="center" spacing={2} sx={{ pt: 5 }}>
        <Typography variant="h4"> Edit Highlight {id}</Typography>
        <Typography dangerouslySetInnerHTML={{ __html: snippet }} />
        <Typography variant="h5"> Existing Tags</Typography>
        <ChangeExistingTags options={tids} onCheck={onCheck} />
        <Typography variant="h5"> New Tags</Typography>
        <TagChooser options={tagEntries} sx={{ width: "75%" }} defaultValue={[]} onChange={onChange} />
        <Button disabled variant="contained">Save</Button>
    </Stack >;
}
