import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useRef } from "preact/hooks";
import { useDb, useModel } from "../../hooks";
import { TaguetteDb } from "../../db";
import { ListRange, Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { HighlightCard } from "../HighlightList";
import { SearchParamProvider } from "../../contexts/SearchParamContext";
import useDebouncedSearchParam from "../../hooks/useDebouncedSearchParam";
import HighlightQueryBuilder from "./HighlightQueryBuilder";
import { useQueryBuilderSql } from "../TagQueryBuilder";
export default () => (
  <SearchParamProvider keys={["offset", "q"]}>
    <HighlightQuerier />
  </SearchParamProvider>
);
const SEARCH_KEY = "offset";
export function HighlightQuerier() {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const whereSql = useQueryBuilderSql("q");
  // let q = `SELECT ht.tag_id as tid, ht.highlight_id as hid, h.snippet, d.id as did, d.name as docName FROM highlight_tags as ht INNER JOIN highlights as h ON ht.highlight_id = h.id INNER JOIN documents as d ON h.document_id = d.id`;
  // q = `SELECT hid, snippet, did, tid, path as tagPath, docName from (${q}) JOIN tags as t ON t.id = tid`;
  // q = `SELECT * FROM (${q})`;
  // q = `SELECT hid, snippet, did, docName, GROUP_CONCAT(tid) as tids, GROUP_CONCAT('»' || tagPath ) as tagPaths FROM (${q}) GROUP BY hid;`;
  // const qData = useDb([], [], q);

  // useEffect(() => {
  //   console.log(qData);
  // }, [qData]);
  // useEffect(() => {
  //   console.log(whereSql);
  // }, [whereSql]);
  // const q = `SELECT h.id
  // FROM highlights h
  // JOIN highlight_tags ht1 ON h.id = ht1.highlight_id
  // JOIN tags t1 ON ht1.tag_id = t1.id AND t1.path like '%notable%'
  // JOIN highlight_tags ht2 ON h.id = ht2.highlight_id
  // JOIN tags t2 ON ht2.tag_id = t2.id AND t2.path like '%acceleration%'`;
  // const whereSql = `hid IN (${q})`;
  const model = (db: TaguetteDb) => () => {
    return db.read.highlightsWhere(whereSql) as any;
  };
  const initalValue: Taguette.DetailedHighlight[] = [];
  const dependencies: any[] = [whereSql];
  const data = useModel<Taguette.DetailedHighlight[]>(
    initalValue,
    model,
    dependencies
  );

  const [offset, setOffsetDebounced, setOffsetImmediate] =
    useDebouncedSearchParam({
      key: SEARCH_KEY,
    });
  // const virtuosoRef = useRef<VirtuosoHandle>(null);
  const setOffset = (offset: number) => {
    setOffsetDebounced(offset.toString());
  };

  const onRange = ({ startIndex: i }: ListRange) => setOffset(i);

  useEffect(() => {
    if (data.length > 0) {
      virtuosoRef.current?.scrollToIndex(Number(0));
      // setOffsetImmediate((0).toString());
    }
  }, [whereSql]);

  // useEffect(() => {
  //   console.log(data);
  // }, [data]);
  const childContent = (_i: number, { hid }: Taguette.DetailedHighlight) => (
    <HighlightCard id={hid} hlIds={data.map(({ hid }) => hid)} />
  );
  const numberOfResultsText = `Showing ${data.length} result${
    data.length === 1 ? "" : "s"
  }`;
  return (
    <Paper
      elevation={1}
      component={Stack}
      sx={{
        p: 2,
        height: "100%",
        overflow: "auto",
      }}
      spacing={2}
      direction="column"
      alignItems="flex-start"
    >
      <Stack
        direction="column"
        sx={{ height: "100%", width: "100%" }}
        spacing={0}
      >
        <HighlightQueryBuilder sx={{ m: 1, mt: 0 }} />
        <Typography
          sx={{ mx: 2, mb: 1, fontSize: "1.125rem", fontWeight: 500 }}
        >
          {numberOfResultsText}
        </Typography>
        <Virtuoso
          ref={virtuosoRef}
          data={data}
          totalCount={data.length}
          itemContent={childContent}
          rangeChanged={onRange}
          initialTopMostItemIndex={Number(offset)}
        />
      </Stack>
    </Paper>
  );
}
