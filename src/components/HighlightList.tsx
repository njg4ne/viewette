import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import { Virtuoso } from "react-virtuoso";
import Chip from "@mui/material/Chip";
import { TagChip } from "./TagTree/TagTreeItems/SingleTagTreeItem";
import {
  useEffect,
  useCallback,
  useLayoutEffect,
  useState,
  useRef,
} from "preact/hooks";

import { TaguetteDb } from "../db";
import { useSnackbar } from "notistack";
import * as popups from "../popups";
import { useLoadingContext } from "../contexts/LoadingContext";
import { dbs, signalReady } from "../signals";
import VirtualList from "./VirtualList";
import Typography from "@mui/material/Typography";
import AutoSizer from "react-virtualized-auto-sizer";
import { Signal, computed, effect } from "@preact/signals";

export default Parent;

function Parent() {
  const [numHlts, setNumHlts] = useState<number>(0);
  useEffect(() => {
    const db = dbs.value;
    const q = `SELECT COUNT(hlts.id) as count FROM highlights as hlts;`;
    db.transactAll([{ sql: q }]).then(([[{ count }]]) => {
      setNumHlts(count);
    });
  }, []);

  const childContent = (i: number) => <Child i={i} />;
  return <Virtuoso totalCount={numHlts} itemContent={childContent} />;
}
function Child({ i }: { i: number }) {
  const [hl, setHl] = useState<Taguette.Highlight | null>(null);
  useEffect(() => {
    // console.log("Mounting child");
    const bindings = { $index: i };
    const sql = `
    SELECT highlights.id,
        highlights.snippet,
        GROUP_CONCAT(tags.path) AS tags,
        GROUP_CONCAT(tags.id) AS tagIds
    FROM (SELECT * FROM highlights LIMIT 1 OFFSET ${"$index"}) as highlights
        LEFT JOIN highlight_tags ON highlights.id = highlight_tags.highlight_id
        LEFT JOIN tags ON highlight_tags.tag_id = tags.id
    GROUP BY highlights.id;`;
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
  }, []);
  return (
    <Box sx={{ m: 1 }}>
      {hl ? (
        <HighlightListItem highlight={hl} />
      ) : (
        <Skeleton variant="rounded" height={"7rem"} />
      )}
    </Box>
  );
}
function HighlightListItem({ highlight }: { highlight: Taguette.Highlight }) {
  return (
    <ListItem component={Paper} elevation={4} sx={{ minWidth: "fit-content" }}>
      {/* <Stack flexDirection="row" flexWrap="nowrap"> */}
      <Stack>
        {ListItemText({
          // sx: { minWidth: "fit-content" },
          primary: (
            <Typography
              // sx={
              //   {
              //     // maxWidth: "100%",
              //   }
              // }
              dangerouslySetInnerHTML={{ __html: highlight.snippet }}
            ></Typography>
          ),
        })}
        <Stack
          direction="row"
          sx={{
            bgcolor: "",
            flexWrap: "wrap",
            // justifyContent: "center",
            py: 1,
          }}
        >
          {highlight.tags?.map((tag, i) => (
            // <Chip
            //   key={i}
            //   sx={{
            //     mr: 0.35,
            //     mt: 0.35,
            //     bgcolor: "primary.main",
            //     color: "primary.contrastText",
            //   }}
            //   label={tag}
            // />
            <TagChip
              key={i}
              tag={tag}
              sx={{
                fontSize: "small",
                fontWeight: "500",
                mr: 0.35,
                mt: 0.35,
              }}
            />
          ))}
        </Stack>
      </Stack>
      {/* </Stack> */}
    </ListItem>
  );
}
