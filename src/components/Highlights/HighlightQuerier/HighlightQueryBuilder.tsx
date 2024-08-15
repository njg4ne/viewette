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
import Box, { BoxProps } from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useSearchParamContext } from "../../../contexts/SearchParamContext";
import { parseSQL } from "react-querybuilder/dist/parseSQL.js";
import { dbs, signalReady } from "../../../signals";
import { useLoadingContext } from "../../../contexts/LoadingContext";
import IconButton from "@mui/material/IconButton";
// import FilterListIcon from '@mui/icons-material/FilterList';
import Stack from "@mui/material/Stack";
import { useFilterActiveContext } from "../../FilterToggler";
// import CancelIcon from '@mui/icons-material/CancelPresentation';
import CloseIcon from "@mui/icons-material/Close";
import { TagAutocomplete } from "../../TagAutocomplete";

export const operators = [
  { name: "=", value: "=", label: "is" } as const,
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

const containOrNot = [
  // { name: "=", value: "=", label: "is" } as const,
  { name: "contains", value: "contains", label: "contain" } as const,
  {
    name: "doesNotContain",
    value: "doesNotContain",
    label: "don't contain",
  } as const,
  // { name: "beginsWith", value: "beginsWith", label: "starts with" } as const,
];
const containsOrNot = [
  { name: "contains", value: "contains", label: "contains" } as const,
  {
    name: "doesNotContain",
    value: "doesNotContain",
    label: "not contains",
  } as const,
];
const docNameOperators = [
  { name: "=", value: "=", label: "is" } as const,
  { name: "!=", value: "!=", label: "is not" } as const,
];

const fields: Field[] = [
  { name: "tagPaths", label: "Tag Paths", operators: containOrNot },
  { name: "docName", label: "Document Name", operators: docNameOperators },
  { name: "snippet", label: "Snippet", operators: containsOrNot },
];

const emptyQuery = {
  combinator: "or",
  rules: [],
};

const QUERY_KEY = "q";
export default (props: BoxProps) => {
  const [queryUri, changeQueryDebounced, ,] = useSearchParamContext(QUERY_KEY);
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
    // console.log("queryFromUri", query);
    return query;
  }, [querySql]);
  const [query, setQuery] = useState<RuleGroupType>(queryFromUri);
  function handleQueryChange(newQuery: RuleGroupType) {
    setQuery(newQuery);
    changeQueryDebounced(encodeURIComponent(formatQuery(newQuery, "sql")));
  }
  const [autoCompleteValue, setAutoCompleteValue] = useState<
    Taguette.Tag | Taguette.Tag[]
  >([]);
  // return (
  //   <TagAutocomplete
  //     multiple
  //     value={autoCompleteValue}
  //     setValue={setAutoCompleteValue}
  //   />
  // );
  return (
    <QueryBuilderMaterial>
      <Box flexGrow={1} {...props}>
        <QueryBuilder
          fields={fields}
          query={query}
          onQueryChange={handleQueryChange}
          operators={operators}
          controlElements={{ valueEditor: ValueEditor }}
        />
      </Box>
    </QueryBuilderMaterial>
  );
};

import { ValueEditor as DefaultValueEditor } from "react-querybuilder";
import { TextField } from "@mui/material";
import { DocumentNameAutocomplete } from "../../DocumentNameAutocomplete";

const ValueEditor = (props: any) => {
  const { field, handleOnChange } = props;
  // console.log(props);
  if (field === "tagPaths") {
    return <TagValueEditor {...props} />;
  }
  if (field === "docName") {
    return <DocNameValueEditor {...props} />;
  }
  return (
    <TextField
      sx={{ flexGrow: 1 }}
      variant="standard"
      {...props}
      onChange={(e: Event) =>
        handleOnChange((e.target as HTMLInputElement).value)
      }
    />
  );
  return <DefaultValueEditor {...props} />;
};

function DocNameValueEditor(props: any) {
  const { field, handleOnChange, value, values } = props;
  const [autoCompleteValue, setAutoCompleteValue] = useState<
    Partial<Taguette.Document>[] | Partial<Taguette.Document>
  >({ name: value });
  function onSetValue(
    v: Partial<Taguette.Document>[] | Partial<Taguette.Document>
  ) {
    setAutoCompleteValue(v);
    handleOnChange((v as Partial<Taguette.Document>).name);
  }
  return (
    <DocumentNameAutocomplete
      sx={{ flexGrow: 1, mb: 1 }}
      // value={value}
      value={autoCompleteValue}
      setValue={onSetValue}
    />
  );
}

function TagValueEditor(props: any) {
  let { field, handleOnChange, value, values } = props;
  // value with no start character
  // if value starts with » then remove that
  if (value.startsWith("»")) {
    value = value.slice(1);
  }
  const [autoCompleteValue, setAutoCompleteValue] = useState<
    Taguette.Tag | Taguette.Tag[]
  >({ path: value } as Taguette.Tag);
  function onSetValue(v: Taguette.Tag | Taguette.Tag[]) {
    setAutoCompleteValue(v);
    handleOnChange(`»${(v as Taguette.Tag).path}`);
  }
  return (
    <TagAutocomplete
      sx={{ flexGrow: 1, mb: 1 }}
      // value={value}
      value={autoCompleteValue}
      setValue={onSetValue}
    />
  );
}
