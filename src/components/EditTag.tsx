// import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
// import { filteredHighlights as highlights, tags } from "../signals";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import { ManagedTagChooser, TagChooser } from "./TagsFilter";
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
// import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import Tooltip from "@mui/material/Tooltip";
import { Link, useSearchParams } from "react-router-dom";
import * as popups from "../popups";

import { signal, effect, computed } from "@preact/signals";

import LexicalEditor from "./LexicalEditor";
import { Box } from "@mui/material";

import { dbs, signalReady } from "../signals";
// import { db } from "../db/models/TaguetteDb";
import { LoadingProvider, useLoadingContext } from "../contexts/LoadingContext";
import { useSnackbar } from "notistack";
import { TaguetteDb } from "../db";
import { useState, useEffect, ChangeEvent } from "react";

export default () => (
  <LoadingProvider>
    <EditTag />
  </LoadingProvider>
);

function EditTag() {
  const [searchParams, _] = useSearchParams();
  const { loading, setLoading } = useLoadingContext();
  const { enqueueSnackbar: sbqr } = useSnackbar();
  const { id } = useParams();
  const [tag, setTag] = useState<Taguette.Tag | null>(null);
  useEffect(() => {
    if (loading || !signalReady(dbs)) return;
    const db: TaguetteDb = dbs.value;
    db.read.tag.byId(Number(id)).then(setTag);
  }, [loading, dbs.value]);
  function save() {
    console.log("save");
  }
  const tagParams = searchParams.get("tags");
  const queryStr = tagParams ? `?tags=${tagParams}` : "";
  return !tag ? null : (
    <Container maxWidth="md" sx={{ alignSelf: "center" }}>
      <EditTagCard tag={tag} />
      {/* <Stack
        alignItems="center"
        spacing={2}
        sx={{ p: 3, my: 3 }}
        component={Paper}
        elevation={1}
      >
        <Paper
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            p: 0.5,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              px: 1,
            }}
          >
            {tag.path}
          </Typography>
        </Paper>
        <Typography variant="h5">Description</Typography>
        <Typography>{tag.description}</Typography>
        <Button onClick={save} disabled={loading} variant="contained">
          Save
        </Button>
      </Stack> */}
    </Container>
  );
}

function TagCard({ tag }: { tag: Taguette.Tag }) {
  return (
    <Card>
      <CardContent>
        <Typography color="text.secondary">Tag Path</Typography>
        <Typography fontSize={"1.5rem"}>{tag.path}</Typography>
        <Typography color="text.secondary" gutterBottom>
          Description
        </Typography>
        <Typography>{tag.description}</Typography>
      </CardContent>
      {/* <CardActions>
        <Button
          onClick={save}
          disabled={loading}
          variant="outlined"
          sx={{
            marginBottom: 1,
            marginLeft: 1,
          }}
        >
          Save
        </Button>
      </CardActions> */}
    </Card>
  );
}

function EditTagCard({ tag }: { tag: Taguette.Tag }) {
  const { loading, setLoading } = useLoadingContext();
  const { enqueueSnackbar: sbqr } = useSnackbar();
  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (loading || !signalReady(dbs)) return;
    const db: TaguetteDb = dbs.value;
    await db.update.tag({ ...tag, description: form.description });
  };
  const onReset = (e?: Event) => {
    e?.preventDefault();
    setForm({ description: tag.description });
  };
  const [form, setForm] = useState({ description: "" });

  useEffect(() => {
    onReset();
  }, [tag]);
  const saveDisabled =
    loading ||
    form.description === tag.description ||
    form.description.trim().length === 0;
  const resetDisabled = loading || form.description === tag.description;
  return (
    <Card component="form" {...{ onSubmit }} value={tag} onReset={onReset}>
      <CardContent>
        <Typography color="text.secondary">Tag Path</Typography>
        <Typography fontSize={"1.5rem"}>{tag.path}</Typography>

        {/* <Typography color="text.secondary" gutterBottom>
          Description
        </Typography> */}
        <Typography color="text.secondary">Description</Typography>
        <TextField
          multiline
          id="description-editor"
          // label="Edit Description"
          variant="standard"
          onChange={(e: Event) => {
            setForm({ description: (e.target as HTMLInputElement).value });
          }}
          value={form.description}
          fullWidth
          inputProps={{ "aria-label": "edit tag description" }}
          sx={
            {
              // wordWrap: "break-word", whiteSpace: "normal",
            }
          }
          name="description"
        />
      </CardContent>
      <Stack
        component={CardActions}
        direction="row"
        // justifyContent="space-around"
        sx={{
          marginBottom: 1,
          marginLeft: 1,
        }}
        spacing={1}
      >
        <Button type="submit" disabled={saveDisabled} variant="outlined">
          Save
        </Button>
        <Button type="reset" disabled={resetDisabled} variant="outlined">
          Reset
        </Button>
      </Stack>
    </Card>
  );
}
