import { useEffect, useMemo, useState } from "react";
import type { DefaultOperator, RuleGroupType } from "react-querybuilder";
import { QueryBuilder } from "react-querybuilder";
// import { fields } from './fields';
import "react-querybuilder/dist/query-builder.css";
// import './styles.scss';
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import { QueryBuilderMaterial } from "@react-querybuilder/material";
import { formatQuery } from "react-querybuilder";
import type { Field } from "react-querybuilder";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useSearchParamContext } from "../contexts/SearchParamContext";
import { parseSQL } from "react-querybuilder/dist/parseSQL.js";
import { dbs, signalReady } from "../signals";
import { useLoadingContext } from "../contexts/LoadingContext";
import IconButton from "@mui/material/IconButton";
// import FilterListIcon from '@mui/icons-material/FilterList';
import Stack from "@mui/material/Stack";
import { useFilterActiveContext } from "./FilterToggler";
// import CancelIcon from '@mui/icons-material/CancelPresentation';
import CloseIcon from "@mui/icons-material/Close";

const fields: Field[] = [
  { name: "path", label: "Tag Path" },
  // { name: 'lastName', label: 'Last Name' },
];

export const tagQueryOperators = [
  // { name: '=', value: '=', label: '=' } as const,
  // { name: '!=', value: '!=', label: '!=' } as const,
  // { name: '<', value: '<', label: '<' } as const,
  // { name: '>', value: '>', label: '>' } as const,
  // { name: '<=', value: '<=', label: '<=' } as const,
  // { name: '>=', value: '>=', label: '>=' } as const,
  { name: "contains", value: "contains", label: "contains" } as const,
  {
    name: "doesNotContain",
    value: "doesNotContain",
    label: "not contains",
  } as const,
  { name: "beginsWith", value: "beginsWith", label: "starts with" } as const,
  {
    name: "doesNotBeginWith",
    value: "doesNotBeginWith",
    label: "not starts with",
  } as const,
  { name: "endsWith", value: "endsWith", label: "ends with" } as const,
  {
    name: "doesNotEndWith",
    value: "doesNotEndWith",
    label: "not ends with",
  } as const,
] satisfies DefaultOperator[];

const emptyQuery = {
  combinator: "or",
  rules: [],
};

export default () => {
  // const [open, setOpen] = useState(false);
  const { active, toggle } = useFilterActiveContext();
  const [queryUri, changeQueryDebounced, ,] = useSearchParamContext("tagQuery");
  // const queryJSON = useMemo(() => decodeURIComponent(queryUri), [queryUri]);
  const querySql = useMemo(() => {
    let sql = "(1 = 1)";
    try {
      const parseRes = decodeURIComponent(queryUri);
      sql = parseRes;
    } catch (e) {}
    return sql;
  }, [queryUri]);
  const queryFromUri = useMemo(() => {
    let query: RuleGroupType = emptyQuery;
    try {
      const parseRes = parseSQL(querySql);
      query = parseRes;
    } catch (e) {}
    return query;
  }, [querySql]);
  const [query, setQuery] = useState<RuleGroupType>(queryFromUri);
  function handleQueryChange(newQuery: RuleGroupType) {
    setQuery(newQuery);
    // setTimeout(() => {
    changeQueryDebounced(encodeURIComponent(formatQuery(newQuery, "sql")));
    // });
  }
  const toggleIcon = (
    <IconButton onClick={toggle} color="secondary">
      <CloseIcon />
    </IconButton>
  );
  return !active ? null : (
    <Stack
      direction="row"
      sx={{ minWidth: "fit-content" }}
      pb={1}
      alignItems="flex-start"
      spacing={1}
    >
      {/* <Typography variant="h5">Filter Tags</Typography> */}
      <QueryBuilderMaterial>
        {toggleIcon}
        <Box flexGrow={1}>
          <QueryBuilder
            fields={fields}
            query={query}
            onQueryChange={handleQueryChange}
            operators={tagQueryOperators}
          />
        </Box>
      </QueryBuilderMaterial>
      {/* <h4>
        SQL as result of <code>formatQuery(query, 'sql')</code>:
      </h4> */}
      {/* <pre>{formatQuery(query, 'sql')}</pre>
      <pre>{`/?${queryUri}`}</pre> */}
    </Stack>
  );
};

const DEFAULT_WHERE = "(1 = 1)";
function useQueryBuilderSql() {
  const [tagQuery] = useSearchParamContext("tagQuery");
  const querySql = useMemo(() => {
    let sql = DEFAULT_WHERE;
    try {
      const parseRes = tagQuery ? decodeURIComponent(tagQuery) : DEFAULT_WHERE;
      sql = parseRes;
    } catch (e) {}
    return sql;
  }, [tagQuery]);
  return querySql;
}

export function useFetchTags(filter: boolean) {
  const [tags, setTags] = useState<Taguette.Tag[]>([]);
  const { loading } = useLoadingContext();
  const whereClause = `WHERE ${!filter ? DEFAULT_WHERE : useQueryBuilderSql()}`;
  useEffect(() => {
    fetchTags(loading, whereClause).then(([newTags]) => {
      if (!newTags) return;
      setTags(newTags as Taguette.Tag[]);
    });
  }, [dbs.value, loading, whereClause]);
  return tags;
}

async function fetchTags(loading: boolean, whereClause: string) {
  if (loading || !signalReady(dbs)) return [];
  const sql = `SELECT * FROM tags ${whereClause};`;
  return await dbs.value.transactAll([{ sql }]);
}
