import React from "react";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { highlights, tags } from "../signals/Filesystems";
import { ManagedTagChooser, TagChooser } from "./TagsFilter";
import { multiWriteQuery } from "../utils/sql";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";

import { signal } from "@preact/signals-react";

import LexicalEditor from "./LexicalEditor";
import { Box } from "@mui/material";

import { convert } from "html-to-text";

function ChangeExistingTags({ options, onCheck, disabled }) {
  const [checked, setChecked] = React.useState([0]);

  return (
    <List component={Card} sx={{ width: "75%" }}>
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
}
const newTags = signal([]);
export default function EditHighlight() {
  const { id } = useParams();
  const highlight = highlights.value?.find((h) => h.id === Number(id));
  //   console.log("highlight", highlight);
  const snippet = highlight?.snippet;
  let tids = highlight?.tags;
  const tagEntries = Object.entries(tags.value).filter(
    ([tid, _]) => !tids.includes(Number(tid))
  );
  tids = tids || [];
  tids = tids.map((tid) => [`${tid}`, tags.value[tid]]);
  const hlTags = tids.map((tid) => tags[tid]);
  const [loading, setLoading] = React.useState(false);
  //   const [richText, setRichText] = React.useState(null);

  //   const [newTags, setNewTags] = React.useState([]);

  // console.log("tids", tids);
  const [toRemove, setToRemove] = React.useState(new Set());
  const [toAdd, setToAdd] = React.useState(new Set());

  const onChange = (event, value) => {
    // console.log("onChange", value);
    // setToAdd((s) => {
    //     value.map(v => Number(v[0])).forEach((v) => s.add(v));
    //     return new Set(s);
    // });
    console.log("onChange", value);
    newTags.value = value;
    setToAdd(new Set(value.map((v) => Number(v[0]))));
  };
  const onCheck = (checked, id) => {
    // console.log("onCheck", checked, id)
    setToRemove((s) => {
      if (checked) {
        s.delete(id);
      } else {
        s.add(id);
      }
      return new Set(s);
    });
  };

  // use effect to both sets and console log them
  // React.useEffect(() => {
  //     console.log("toRemove", toRemove);
  //     console.log("toAdd", toAdd);
  // }, [toRemove, toAdd]);

  const buttonDisabled = toRemove.size === 0 && toAdd.size === 0;
  function save() {
    const highlight_id = Number(id);
    const tags_to_remove = [...toRemove];
    const tags_to_add = [...toAdd];
    // console.log(
    //   `save ${highlight_id} remove ${tags_to_remove} add ${tags_to_add}`
    // );
    let q = "";
    if (tags_to_remove.length > 0) {
      q += `DELETE FROM highlight_tags WHERE highlight_id=${highlight_id} AND tag_id IN (${tags_to_remove.join(
        ", "
      )});`;
    }
    if (tags_to_add.length > 0) {
      q += `INSERT INTO highlight_tags (highlight_id, tag_id) VALUES ${tags_to_add
        .map((tid) => `(${highlight_id}, ${tid})`)
        .join(", ")};`;
    }
    console.log(q);
    newTags.value = [];
    setLoading(true);
    multiWriteQuery(q).then(() => {
      setToAdd(new Set());
      setToRemove(new Set());
      setLoading(false);
      // TODO update the page controls
    });
  }
  //   Button__root___1gz0c define background: yellow for this class
  function saveText(newText) {
    const q = `UPDATE highlights SET snippet='${newText}' WHERE id=${id};`;
    setLoading(true);
    multiWriteQuery(q).then(() => {
      setLoading(false);
    });
  }
  return (
    <Stack alignItems="center" spacing={2} sx={{ pt: 5 }}>
      <Typography variant="h4"> Edit Highlight {id}</Typography>
      <Typography dangerouslySetInnerHTML={{ __html: snippet }} />
      <Box sx={{ height: "50vh", width: "100%" }}>
        <LexicalEditor
          defaultValue={snippet}
          onSave={saveText}
          loading={loading}
        />
      </Box>
      {tids.length > 0 ? (
        <>
          <Typography variant="h5"> Existing Tags</Typography>
          <ChangeExistingTags
            options={tids}
            onCheck={onCheck}
            disabled={loading}
          />
        </>
      ) : null}
      <Typography variant="h5"> New Tags</Typography>
      {/* <TagChooser
        options={tagEntries}
        sx={{ width: "75%" }}
        defaultValue={[]}
        onChange={onChange}
      /> */}
      <ManagedTagChooser
        options={tagEntries}
        sx={{ width: "75%" }}
        defaultValue={[]}
        onChange={onChange}
        value={newTags.value}
        disabled={loading}
      />
      <Button onClick={save} disabled={buttonDisabled} variant="contained">
        Save
      </Button>
    </Stack>
  );
}
