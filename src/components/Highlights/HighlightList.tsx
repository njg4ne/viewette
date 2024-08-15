import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import type { ListRange, VirtuosoHandle } from "react-virtuoso";
import { Virtuoso } from "react-virtuoso";
import Chip from "@mui/material/Chip";
import { TagChip } from "../TagChip";
import {
  useEffect,
  useCallback,
  useLayoutEffect,
  useState,
  useRef,
} from "preact/hooks";
import LaunchIcon from "@mui/icons-material/Launch";

import { TaguetteDb } from "../../db";
import { useSnackbar } from "notistack";
import * as popups from "../../popups";
import { useLoadingContext } from "../../contexts/LoadingContext";
import { dbs, signalReady } from "../../signals";
import VirtualList from "../VirtualList";
import Typography from "@mui/material/Typography";
import AutoSizer from "react-virtualized-auto-sizer";
import { Signal, computed, effect } from "@preact/signals";
import { useTreeContext } from "../../contexts/TagTreeContext";
import { useHighlightsContext } from "../../contexts/HighlightsContext";
// import { useNavigate } from "react-router-dom";
import { Link, useSearchParams } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import useDebouncedSearchParam from "../../hooks/useDebouncedSearchParam";
import EditHighlight from "./EditHighlight/EditHighlight";
import { useTheme } from "@mui/material/styles";
import { useDroppable } from "@dnd-kit/core";
import { RefObject } from "preact";
import { CopyHighlightIconButton, getCopyText } from "./CopyHighlight";
// import TaggingSummaryExporter from "../TaggingSummaryExportButton";

export default Parent;
const SEARCH_KEY = "hlOffset";
function Parent() {
  const { hlIds, infoText, numHlts } = useHighlightsContext();
  const { selectedItems } = useTreeContext();
  const [hlOffset, setHlOffsetDebounced, setHlOffsetImmediate] =
    useDebouncedSearchParam({
      key: SEARCH_KEY,
    });
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const setOffset = (offset: number) => {
    setHlOffsetDebounced(offset.toString());
  };

  const onRange = ({ startIndex: i }: ListRange) => setOffset(i);

  useEffect(() => {
    if (selectedItems.length > 0) {
      setHlOffsetImmediate((0).toString());
    }
  }, [selectedItems]);

  // useEffect(() => {
  //   virtuosoRef.current?.scrollToIndex(Number(hlOffset));
  // }, [hlOffset]);

  const childContent = (_i: number, hid: number) => (
    <HighlightCard id={hid} hlIds={hlIds} />
  );
  return (
    <>
      <Stack direction="column" sx={{ height: "100%" }} spacing={0}>
        {/* <Stack direction="row" sx={{ justifyContent: "space-between" }}> */}
        <Typography children={infoText} sx={{ px: 2, py: 1 }} />
        {/* <TaggingSummaryExporter
            sx={{
              alignSelf: "flex-start",
              m: 1,
              mb: 2,
            }}
          // /> */}
        {/* </Stack> */}
        <Virtuoso
          ref={virtuosoRef}
          data={hlIds}
          totalCount={numHlts}
          itemContent={childContent}
          rangeChanged={onRange}
          initialTopMostItemIndex={Number(hlOffset)}
        />
      </Stack>
    </>
  );
}
export function HighlightCard({ id, hlIds }: { id: number; hlIds: number[] }) {
  // const { hlIds } = useHighlightsContext();
  // const id = hlIds[index];
  const [hl, setHl] = useState<Taguette.Highlight | null>(null);
  const { loading } = useLoadingContext();
  useEffect(() => {
    if (loading || !signalReady(dbs)) return;
    const bindings = { $id: id };
    const sql = `
    SELECT highlights.id,
        highlights.snippet,
        GROUP_CONCAT(tags.path) AS tags,
        GROUP_CONCAT(tags.id) AS tagIds,
        d.name AS source
    FROM (SELECT * FROM highlights as h WHERE h.id = ${"$id"}) as highlights
        LEFT JOIN highlight_tags ON highlights.id = highlight_tags.highlight_id
        LEFT JOIN tags ON highlight_tags.tag_id = tags.id
        LEFT JOIN documents AS d ON highlights.document_id = d.id
    GROUP BY highlights.id;`;
    // const sql = `
    // SELECT highlights.id,
    //     highlights.snippet,
    //     GROUP_CONCAT(tags.path) AS tags,
    //     GROUP_CONCAT(tags.id) AS tagIds
    // FROM (SELECT * FROM highlights LIMIT 1 OFFSET ${"$index"}) as highlights
    //     LEFT JOIN highlight_tags ON highlights.id = highlight_tags.highlight_id
    //     LEFT JOIN tags ON highlight_tags.tag_id = tags.id
    // GROUP BY highlights.id;`;
    dbs.value
      .transactAll([
        { sql, bindings },
        // { sql: "SELECT * from tags where id = 1;" },
      ])
      .then(([[hl]]) => {
        hl.tags = hl.tags ? hl.tags.split(",") : [];
        hl.tagIds = hl.tagIds ? hl.tagIds.split(",").map(Number) : [];
        setHl(hl);
      });
  }, [loading, id]);
  return (
    <Box sx={{ m: 1, mt: 0 }}>
      {hl ? (
        <HighlightListItem highlight={hl} hlIds={hlIds} />
      ) : (
        <Skeleton variant="rounded" height={"7rem"} />
      )}
    </Box>
  );
}
function HighlightListItem2({ highlight }: { highlight: Taguette.Highlight }) {
  return (
    <ListItem
      component={Paper}
      elevation={4}
      sx={{
        minWidth: "fit-content",
        pr: 0,
        py: 0.25,
        display: "flex",
        flexWrap: "nowrap",
        alignItems: "stretch",
        justifyContent: "space-between",
      }}
    >
      <EditHighlight id={highlight.id} />
    </ListItem>
  );
}
function HighlightListItem({
  highlight,
  hlIds,
}: {
  highlight: Taguette.Highlight;
  hlIds: number[];
}) {
  const snippetRef = useRef<HTMLSpanElement>(null);
  const liRef = useRef<HTMLLIElement>(null);
  // const sourceRef = useRef<HTMLSpanElement>(null);
  // const navigate = useNavigate();
  // const onClick = () => {
  //   navigate(`/highlights/${highlight.id}`);
  // };
  // const { hlIds } = useHighlightsContext();
  const action = {
    label: "view highlight and taggings",
    icon: LaunchIcon,
    link: `/highlights/${highlight.id}`,
    state: { hlIds },
  };
  const { isOver, setNodeRef: dropRef } = useDroppable({
    id: `droppables.hls.${highlight.id}`,
    data: { highlight },
  });
  const textPrimary = useTheme().palette?.text?.primary || "green";

  return (
    <ListItem
      id={`highlight-li-${highlight.id}`}
      tabIndex={0}
      // add copy to clipboard behavior via default action
      onCopy={(e: Event & any) => {
        e.preventDefault();
        e.clipboardData.setData(
          "text/plain",
          getCopyText(snippetRef, highlight.source)
        );
      }}
      ref={dropRef}
      component={Paper}
      elevation={4}
      sx={{
        border: isOver ? `.125rem solid ${textPrimary}` : "",
        minWidth: "fit-content",
        pr: 0,
        py: 0.25,
        display: "flex",
        flexWrap: "nowrap",
        alignItems: "stretch",
        justifyContent: "space-between",
        transition: "margin 0.25s",
        "&:focus": {
          // animate the transition to the margin
          transition: "margin 0.25s",
          my: 2,
          outline: `.125rem solid ${textPrimary}`, // Customize the outline style for focus
        },
      }}
    >
      <Stack
        sx={{
          py: 0.75,
        }}
        spacing={1}
      >
        {/* <Paper variant="outlined" sx={{ px: 1 }}> */}
        {ListItemText({
          primary: (
            <Typography
              ref={snippetRef}
              // fontSize="1rem"
              // fontWeight={400}
              display="inline"
              dangerouslySetInnerHTML={{
                __html: highlight.snippet,
              }}
            ></Typography>
          ),
        })}
        {/* </Paper> */}
        <Stack
          direction="row"
          sx={{
            bgcolor: "",
            flexWrap: "wrap",
            // py: 0.5,
          }}
        >
          {highlight.tags?.map((tag, i) => (
            <TagChip
              key={i}
              tag={tag}
              sx={{
                fontSize: "small",
                fontWeight: "500",
                mr: 0.5,
                mt: 0.5,
              }}
            />
          ))}
        </Stack>
        <Typography fontWeight={800}>
          Source: <Typography display="inline">{highlight.source}</Typography>
        </Typography>
      </Stack>
      <Stack>
        <IconButton
          aria-label={action.label}
          // onClick={() => action?.action()}
          component={Link}
          to={action.link}
          state={action.state}
          sx={{
            borderRadius: 1,
            ml: 0.5,
            // mr: 2,
            // p: 0.5,
          }}
        >
          {action.icon({
            // fontSize: ".25rem",
            sx: {
              fontSize: "1.5rem",
            },
          })}
        </IconButton>
        <CopyHighlightIconButton
          focus={() =>
            document.getElementById(`highlight-li-${highlight.id}`)?.focus()
          }
          snippetSpanRef={snippetRef}
          highlight={highlight}
        />
      </Stack>
    </ListItem>
  );
}

// import Stack from "@mui/material/Stack";
// import { Virtuoso } from "react-virtuoso";
// import { useEffect, useState } from "preact/hooks";
// import { dbs } from "../signals";
// import Typography from "@mui/material/Typography";
// import { useTreeContext } from "../contexts/TagTreeContext";
// import { reducer, HighlightCard } from "./HighlightList";

// export function Parent() {
//   const [numHlts, setNumHlts] = useState<number>(0);
//   const [hlIds, setHlIds] = useState<number[]>([]);
//   const { selectedTags } = useTreeContext();
//   const tagsAreSelected = selectedTags.length > 0;
//   const infoText = `Showing${
//     !tagsAreSelected ? " all" : ""
//   } ${numHlts} highlights${
//     tagsAreSelected
//       ? ` tagged with any of ${selectedTags.length} selected tags`
//       : ""
//   }.`;
//   const selectedTagPlaceholders = selectedTags.map((t, i) => `$${i + 1}`);
//   const optionsPlaceholder = `${selectedTagPlaceholders.join(",")}`;
//   const maybeFilter =
//     selectedTags.length === 0 ? "" : `WHERE t.path in (${optionsPlaceholder})`;

//   useEffect(() => {
//     console.log(optionsPlaceholder);
//     setNumHlts(hlIds.length);
//   }, [hlIds]);
//   // const numHlts = hlIds.length;
//   useEffect(() => {
//     const db = dbs.value;
//     const q = `
//     SELECT DISTINCT h.id
//     FROM highlights as h
//       LEFT JOIN highlight_tags AS ht
//         ON h.id = ht.highlight_id
//       LEFT JOIN tags as t
//         ON t.id = ht.tag_id
//         ${maybeFilter}
//     ;`;
//     const bindings = selectedTags.reduce(
//       ((a, c, i, arr) => {
//         a[selectedTagPlaceholders[i]] = c;
//         return a;
//       }) as reducer,
//       {} as Record<string, string>
//     );
//     db.transactAll([{ sql: q, bindings }]).then(([ids]) => {
//       setNumHlts(0);
//       setHlIds(ids.map(({ id }) => id));
//     });
//   }, [selectedTags]);

//   const childContent = (i: number) => <HighlightCard id={hlIds[i]} />;
//   return (
//     <>
//       {/* <Stack direction="row" alignItems="stretch">
//               <Stack direction="column" alignItems="stretch">
//                  */}
//       <Stack direction="column" sx={{ height: "100%" }} spacing={0}>
//         <Typography children={infoText} sx={{ p: 2 }} />
//         {/* <Box
//               sx={{
//                 // flexGrow: 1,
//                 // overflow: "auto",
//                 bgcolor: "red",
//                 // width: "100%",
//                 height: "5in",
//               }}
//             ></Box> */}
//         <Virtuoso totalCount={numHlts} itemContent={childContent} />
//       </Stack>
//       {/*  */}
//       {/*
//             </Stack> */}
//       {/* </Box> */}
//     </>
//     // <>
//     // </>
//   );
// }
