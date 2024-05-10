// import React, { useEffect } from "preact/compat";
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
import { useState, useEffect, ChangeEvent, useRef } from "preact/compat";
import { useHotkeys } from "react-hotkeys-hook";

export default () => (
  <LoadingProvider>
    <EditHighlight />
  </LoadingProvider>
);

function EditHighlight() {
  const [searchParams, _] = useSearchParams();
  const { loading, setLoading } = useLoadingContext();
  const { enqueueSnackbar: sbqr } = useSnackbar();
  const { id } = useParams();
  const [hl, setHl] = useState<Taguette.Highlight | null>(null);
  useEffect(() => {
    if (loading || !signalReady(dbs)) return;
    const db: TaguetteDb = dbs.value;
    const bindings = { $id: Number(id) };
    const sql = `SELECT * FROM highlights WHERE id = $id;`;
    db.transactAll([{ sql, bindings }]).then(([[newHl]]) => {
      setHl(newHl);
    });
  }, [loading, dbs.value]);
  function save() {
    console.log("save");
  }
  const tagParams = searchParams.get("tags");
  const queryStr = tagParams ? `?tags=${tagParams}` : "";
  return !hl ? null : (
    <Container maxWidth="md" sx={{ alignSelf: "center" }}>
      <HlCard hl={hl} />
    </Container>
  );
}

function HlCard({ hl }: { hl: Taguette.Highlight }) {
  return (
    <Card>
      <CardContent>
        <Typography color="text.secondary">Title</Typography>
        <Typography fontSize={"1.5rem"} gutterBottom>
          Highlight ID {hl.id}
        </Typography>
        <Typography color="text.secondary">Text Snippet</Typography>
        <Typography
          fontSize={"1.2rem"}
          dangerouslySetInnerHTML={{ __html: hl.snippet }}
        ></Typography>
      </CardContent>
    </Card>
  );
}

// function EditHighlightCard({ hl }: { hl: Taguette.Highlight }) {
//   const formRef = useRef<HTMLFormElement>(null);
//   const { loading, setLoading } = useLoadingContext();
//   const { enqueueSnackbar: sbqr } = useSnackbar();
//   const onSubmit = async (e: SubmitEvent) => {
//     e.preventDefault();
//     if (loading || !signalReady(dbs)) return;
//     const db: TaguetteDb = dbs.value;
//     setLoading(true);
//     const sql = `UPDATE highlights SET snippet = $snippet WHERE id = $id;`;
//     const bindings = { $snippet: form.snippet, $id: hl.id };
//     await db.transactAll([{ sql, bindings }]);
//     // await db.update.tag({ ...hl, snippet: form.snippet });
//     sbqr("Highlight updated", { variant: "success" });
//     setLoading(false);
//   };
//   const onReset = (e?: Event) => {
//     e?.preventDefault();
//     setForm({ snippet: hl.snippet });
//   };
//   const [form, setForm] = useState({ snippet: "" });

//   useEffect(() => {
//     onReset();
//   }, [hl]);
//   const saveDisabled =
//     loading || form.snippet === hl.snippet || form.snippet.trim().length === 0;

//   const resetDisabled = loading || form.snippet === hl.snippet;

//   var isMacLike = navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i)
//     ? true
//     : false;
//   const modifierKey = isMacLike ? "Cmd" : "Ctrl";
//   const modifierKeySymbol = isMacLike ? "⌘" : "Ctrl";
//   return (
//     <Card
//       component="form"
//       {...{ onSubmit }}
//       // value={new FormData(hl)}
//       onReset={onReset}
//       ref={formRef}
//     >
//       <CardContent>
//         <Typography color="text.secondary">Tag Path</Typography>
//         <Typography fontSize={"1.5rem"}>Highlight ID: {hl.id}</Typography>

//         <Typography color="text.secondary">Highlight Text</Typography>
//         <TextField
//           multiline
//           id="snippet-editor"
//           // label="Edit Description"
//           variant="standard"
//           onChange={(e: Event) => {
//             setForm({ snippet: (e.target as HTMLInputElement).value });
//           }}
//           value={form.snippet}
//           fullWidth
//           inputProps={{
//             "aria-label": "edit tag snippet",
//             onKeyDown: function (e) {
//               if ((e.ctrlKey || e.metaKey) && e.key == "Enter") {
//                 if (!saveDisabled) {
//                   formRef.current?.requestSubmit();
//                 }
//               }
//             },
//           }}
//           sx={
//             {
//               // wordWrap: "break-word", whiteSpace: "normal",
//             }
//           }
//           name="snippet"
//         />
//       </CardContent>
//       <Stack
//         component={CardActions}
//         direction="row"
//         // justifyContent="space-around"
//         sx={{
//           marginBottom: 1,
//           marginLeft: 1,
//         }}
//         spacing={1}
//       >
//         <Button type="submit" disabled={saveDisabled} variant="outlined">
//           Save ({modifierKeySymbol} + Enter)
//         </Button>
//         <Button type="reset" disabled={resetDisabled} variant="outlined">
//           Reset
//         </Button>
//       </Stack>
//     </Card>
//   );
// }
