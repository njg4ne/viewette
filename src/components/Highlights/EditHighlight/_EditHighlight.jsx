import React, { useEffect } from "preact/compat";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
// import { filteredHighlights as highlights, tags } from "../signals";
import { ManagedTagChooser, TagChooser } from "../../TagsFilter";
// import { multiWriteQuery } from "../utils/sql";
// core-js(-pure)/actual|full/set/difference
// import "core-js/actual/set/difference";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import Tooltip from "@mui/material/Tooltip";
import { Link, useSearchParams } from "react-router-dom";

import { signal, effect, computed } from "@preact/signals";

import LexicalEditor from "../../LexicalEditor";
import { Box } from "@mui/material";

// import { convert } from "html-to-text";
import { dbs, signalReady } from "../../../signals";
// import {db} from "../db/models/TaguetteDb";
// import

function ChangeExistingTags({ options, onCheck, disabled }) {
  const [checked, setChecked] = React.useState([0]);

  return (
    <List component={Card} sx={{ width: "75%" }}>
      {options.map(([tid, tagName]) => {
        const labelId = `checkbox-list-label-${tid}`;

        return (
          <ListItem
            key={tid}
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
// const highlight = signal(null);
// effect(async () => {
//   const { id } = useParams();
//   highlight.value = await opfsDb.value?.getHighlight(Number(id));
// });
export default function EditHighlight() {
  const [searchParams, _] = useSearchParams();
  const { id } = useParams();
  const [highlight, setHighlight] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [toRemove, setToRemove] = React.useState(new Set());
  const [toAdd, setToAdd] = React.useState(new Set());
  useEffect(async () => {
    if (loading || !signalReady(dbs)) return;
    // console.log("fetching highlight", id);
    const db = dbs.value;
    const task = db.getHighlight(Number(id));
    const h = await task;
    setHighlight(h);
    return () => {
      task.cancel();
    };
  }, [id, loading]);
  const snippet = highlight?.snippet || "";
  let tids = highlight?.tagIds || [];
  const hlTags = highlight?.tags || [];
  // console.log("tids", tids);
  // console.log("hlTags", hlTags);
  const tagEntries = zip([tids || [], hlTags || []]) || [];
  let unusedTagEntries = Object.entries(tags.value)
    .map(([k, v]) => [Number(k), v])
    .filter(([tid, _]) => !tids.includes(tid));

  const onChange = (event, value) => {
    newTags.value = value;
    setToAdd(new Set(value.map((v) => Number(v[0]))));
  };
  const onCheck = (checked, id) => {
    setToRemove((s) => {
      if (checked) {
        s.delete(id);
      } else {
        s.add(id);
      }
      return new Set(s);
    });
  };
  function getNextId() {
    // find this id in highlights, then advance the index wrapping around using % and length
    const idx = highlights.value.findIndex((h) => h.id === Number(id));
    return highlights.value[(idx + 1) % highlights.value.length]?.id ?? id;
  }
  function getPrevId() {
    // find this id in highlights, then advance the index wrapping around using % and length
    let idx = highlights.value.findIndex((h) => h.id === Number(id));
    idx -= 1;
    idx = idx < 0 ? highlights.value.length - 1 : idx;
    return highlights.value[idx]?.id ?? id;
  }

  const buttonDisabled = toRemove.size === 0 && toAdd.size === 0;
  function save() {
    setLoading(true);
    const hid = Number(id);
    // console.log({ hid, toRemove, toAdd });
    updateTagsForHighlight(hid, toRemove, toAdd).then(() => {
      newTags.value = [];
      setToAdd(new Set());
      setToRemove(new Set());
      setLoading(false);
    });
  }
  function saveText(newText) {
    const q = `UPDATE highlights SET snippet='${newText}' WHERE id=${id};`;
    setLoading(true);
    multiWriteQuery(q).then(() => {
      setLoading(false);
    });
  }
  const tagParams = searchParams.get("tags");
  const queryStr = tagParams ? `?tags=${tagParams}` : "";
  return (
    <Container maxWidth="md" sx={{ alignSelf: "center" }}>
      <Stack
        alignItems="center"
        spacing={2}
        sx={{ p: 3, my: 3 }}
        component={Paper}
        elevation={1}
      >
        <Stack direction={"row"}>
          <Tooltip title="Previous highlight">
            <IconButton
              aria-label="Previous highlight"
              component={Link}
              to={`/highlights/${getPrevId()}${queryStr}`}
              replace
            >
              <NavigateBeforeIcon fontSize="large" />
            </IconButton>
          </Tooltip>
          {/* <Stack > */}
          <Typography variant="h4" component={Stack} justifyContent={"center"}>
            {" "}
            Edit Highlight {id}
          </Typography>
          {/* </Stack> */}
          <Tooltip title="Next highlight">
            <IconButton
              aria-label="Next highlight"
              component={Link}
              to={`/highlights/${getNextId()}${queryStr}`}
              replace
            >
              <NavigateNextIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Typography dangerouslySetInnerHTML={{ __html: snippet }} />
        {/* <Box sx={{ height: "50vh", width: "100%" }}>
        <LexicalEditor
          defaultValue={snippet}
          onSave={saveText}
          loading={loading}
        />
      </Box> */}
        {tagEntries.length > 0 ? (
          <>
            <Typography variant="h5"> Existing Tags</Typography>
            <ChangeExistingTags
              options={tagEntries}
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
          options={unusedTagEntries}
          sx={{ width: "75%" }}
          defaultValue={[]}
          onChange={onChange}
          // value={[...toAdd].map((num) => num.toString())}
          value={newTags.value}
          disabled={loading}
        />
        <Button onClick={save} disabled={buttonDisabled} variant="contained">
          Save
        </Button>
      </Stack>
    </Container>
  );
}
