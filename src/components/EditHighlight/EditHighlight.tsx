import {
  LinkProps,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
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

import IconButton from "@mui/material/IconButton";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import RightArrowKeyIcon from "@mui/icons-material/Forward";

export default () => (
  // <LoadingProvider>
  <EditHighlight />
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
  }, [loading, dbs.value, id]);
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

export function entrify(tags: Taguette.Tag[]): [number, string][] {
  return tags.map(({ id, path }: Taguette.Tag) => [id, path]);
}
const newTags = signal([]);
function HlCard({ hl }: { hl: Taguette.Highlight }) {
  const { id } = useParams();
  const { loading, setLoading } = useLoadingContext();
  const { enqueueSnackbar: sbqr } = useSnackbar();
  const bindings = { $hid: id };
  const sql = `
  SELECT id, path FROM tags 
  JOIN highlight_tags ON tags.id = highlight_tags.tag_id 
  WHERE highlight_tags.highlight_id = $hid;`;
  // const [currentTags, setCurrentTags] = useState<Taguette.Tag[]>([]);
  // const [data, setData] = useState<Taguette.Tag[]>([]);
  // function getCurrentTags() {
  //   if (!signalReady(dbs)) return;
  //   const db: TaguetteDb = dbs.value;
  //   db.transactAll([{ sql, bindings }]).then(([newData]) => {
  //     setCurrentTags(newData as Taguette.Tag[]);
  //   });
  // }

  const currentTags = useDb<Taguette.Tag[]>([], [id], sql, bindings);
  const allTags = useModel<Taguette.Tag[]>([], (db) => db.read.tags, [id]);
  console.log("currentTags", ...currentTags, id, bindings);
  const tagEntries = [] as const;
  const [toRemove, setToRemove] = useState<Set<number>>(new Set());
  const [toAdd, setToAdd] = useState<Set<number>>(new Set());

  const unusedTagEntries = entrify(
    allTags.filter(({ id }) => !currentTags.some((t) => t.id === id))
  );
  useEffect(() => {
    // if (loading) return;
    newTags.value = [];
    setToAdd(new Set());
    setToRemove(new Set());
  }, [id]);

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
        <TitlewithNavigationArrows>
          <Stack>
            <Typography color="text.secondary">Title</Typography>
            <Typography fontSize={"1.5rem"} gutterBottom>
              Highlight ID {hl.id} from {hl.source}
            </Typography>{" "}
          </Stack>
        </TitlewithNavigationArrows>
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
            options={entrify(currentTags)}
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

function TitlewithNavigationArrows({
  children,
}: {
  children?: JSX.Element | JSX.Element[];
}) {
  const leftButtonRef = useRef<HTMLButtonElement>(null);
  const rightButtonRef = useRef<
    LinkProps & React.RefAttributes<HTMLAnchorElement>
  >(null);
  const { id } = useParams();
  let { state } = useLocation();
  const navigate = useNavigate();

  state = state || { hlIds: [id] };
  const { hlIds } = state;
  const index = hlIds?.indexOf(Number(id));
  const prevIndex = (index + hlIds.length - 1) % hlIds.length;
  const nextIndex = (index + 1) % hlIds.length;
  const getPrevId = () => hlIds[prevIndex];
  const getNextId = () => hlIds[nextIndex];

  const onKeyRight = () =>
    navigate(`/highlights/${getNextId()}`, { state, replace: true });
  const onKeyLeft = () =>
    navigate(`/highlights/${getPrevId()}`, { state, replace: true });
  useHotkeys("right", onKeyRight);
  useHotkeys("left", onKeyLeft);

  return (
    <Stack
      direction="row"
      // fullWidth
      // bgcolor={"red"}
      justifyContent={"space-between"}
      alignItems="flex-start"
    >
      {children}
      <Stack direction="row">
        {/* <RightKey /> */}
        <Tooltip title="Previous highlight">
          <IconButton
            ref={leftButtonRef}
            aria-label="Previous highlight (left key)"
            component={Link}
            state={state}
            to={`/highlights/${getPrevId()}`}
            replace
          >
            {/* <NavigateBeforeIcon fontSize="large" />
             */}
            <RightArrowKeyIcon
              fontSize="large"
              sx={{ transform: "rotate(180deg)" }}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title="Next highlight (right key)">
          <IconButton
            ref={rightButtonRef}
            aria-label="Next highlight"
            component={Link}
            to={`/highlights/${getNextId()}`}
            state={state}
            replace
          >
            {/* <NavigateNextIcon fontSize="large" />
             */}
            <RightArrowKeyIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}
