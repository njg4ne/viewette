import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useRef } from "preact/hooks";
import { useModel } from "../../hooks";
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
    <HighlightCard id={hid} />
  );
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
        <HighlightQueryBuilder sx={{ m: 2, mt: 0 }} />
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
