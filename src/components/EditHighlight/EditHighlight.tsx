import { useParams } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import { Link, useSearchParams } from "react-router-dom";
import * as popups from "../../popups";
import { ManagedTagChooser } from "../TagsFilter";
import { dbs, signalReady } from "../../signals";
import {
  LoadingProvider,
  useLoadingContext,
} from "../../contexts/LoadingContext";
import { useSnackbar } from "notistack";
import { TaguetteDb } from "../../db";
import { useState, useEffect, ChangeEvent, useRef } from "preact/compat";
import { useHotkeys } from "react-hotkeys-hook";
import ExistingTagsEditor from "./ExistingTagsEditor";
import { useTreeContext } from "../../contexts/TagTreeContext";
import Button from "@mui/material/Button";
import { useDb, useModel } from "../../hooks";
import { signal } from "@preact/signals";
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
    const sql = `
    SELECT h.*, d.name as source 
    FROM highlights as h 
    JOIN documents as d ON h.document_id = d.id
    WHERE h.id = $id;`;
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

function entrify(tags: Taguette.Tag[]): [number, string][] {
  return tags.map(({ id, path }: Taguette.Tag) => [id, path]);
}
const newTags = signal([]);
function HlCard({ hl }: { hl: Taguette.Highlight }) {
  const { loading, setLoading } = useLoadingContext();
  const { enqueueSnackbar: sbqr } = useSnackbar();
  const bindings = { $hid: hl.id };
  const sql = `
  SELECT id, path FROM tags 
  JOIN highlight_tags ON tags.id = highlight_tags.tag_id 
  WHERE highlight_tags.highlight_id = $hid;`;
  const data = useDb<Taguette.Tag[]>([], sql, bindings);
  const tagEntries = [] as const;
  const [toRemove, setToRemove] = useState<Set<number>>(new Set());
  const [toAdd, setToAdd] = useState<Set<number>>(new Set());
  const allTags = useModel<Taguette.Tag[]>([], (db) => db.read.tags);
  const unusedTagEntries = entrify(
    allTags.filter(({ id }) => !data.some((t) => t.id === id))
  );
  // useEffect(() => {
  //   console.log("toRemove", allTags);
  // }, [allTags]);

  function onCheck(checked: boolean, id: number) {
    setToRemove((s) => {
      if (checked) {
        s.delete(id);
      } else {
        s.add(id);
      }
      return new Set(s);
    });
  }
  const onChange = (event: Event, newValue: [number, string][]) => {
    console.log("onChange", newValue);
    //@ts-ignore
    newTags.value = newValue;
    setToAdd(new Set(newValue.map(([id]) => id)));
  };
  const numChanges = toRemove.size + toAdd.size;
  const submitDisabled = loading || numChanges === 0;
  const onSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!signalReady(dbs) || submitDisabled) return;
    const db: TaguetteDb = dbs.value;
    setLoading(true);
    await db.update.tags.forHighlight(hl.id, [...toRemove], [...toAdd]);
    newTags.value = [];
    setToAdd(new Set());
    setToRemove(new Set());
    sbqr("Tags updated", { variant: "success" });
    setLoading(false);
  };
  const saveBtnText = `Save ${numChanges} Change${numChanges === 1 ? "" : "s"}`;

  return (
    <Card>
      <CardContent>
        <Typography color="text.secondary">Title</Typography>
        <Typography fontSize={"1.5rem"} gutterBottom>
          Highlight ID {hl.id} from {hl.source}
        </Typography>
        <Typography color="text.secondary">Text Snippet</Typography>
        <Typography
          fontSize={"1.2rem"}
          dangerouslySetInnerHTML={{ __html: hl.snippet }}
        ></Typography>
        <form onSubmit={onSubmit}>
          <Typography color="text.secondary">Add New Tags</Typography>
          <ManagedTagChooser
            options={unusedTagEntries}
            sx={{ width: undefined, my: 1 }}
            defaultValue={[]}
            onChange={onChange}
            // value={[...toAdd].map((num) => num.toString())}
            value={newTags.value}
            disabled={loading}
          />
          <Typography color="text.secondary">Remove Existing Tags</Typography>
          <ExistingTagsEditor
            options={entrify(data)}
            onCheck={onCheck}
            disabled={loading}
          />
          <Button
            sx={{ mt: 2 }}
            type="submit"
            disabled={submitDisabled}
            variant="outlined"
          >
            {saveBtnText}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
// function zip(arrays) {
//   return arrays[0].map((_, i) => arrays.map((array) => array[i]));
// }

// const [hl, setHl] = useState<Taguette.Highlight | null>(null);
// useEffect(() => {
//   if (loading || !signalReady(dbs)) return;
//   const db: TaguetteDb = dbs.value;
//   const bindings = { $id: Number(id) };
//   const sql = `SELECT * FROM highlights WHERE id = $id;`;
//   db.transactAll([{ sql, bindings }]).then(([[newHl]]) => {
//     setHl(newHl);
//   });
// }, [loading, dbs.value]);

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
