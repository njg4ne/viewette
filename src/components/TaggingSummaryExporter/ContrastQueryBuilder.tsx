import { tagQueryOperators } from "../QueryBuilder";
import type {} from "react-querybuilder";
import { QueryBuilder, formatQuery } from "react-querybuilder";
import { QueryBuilderMaterial } from "@react-querybuilder/material";
import type { Field, DefaultOperator, RuleGroupType } from "react-querybuilder";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { parseSQL } from "react-querybuilder/dist/parseSQL.js";
import { useState } from "preact/hooks";

const emptyQuery = {
  combinator: "or",
  rules: [],
};
const fields: Field[] = [{ name: "path", label: "Contrast Tag" }];
//get type from return value of useStatuseState<RuleGroupType>
// type StateType = ReturnType<typeof useState<RuleGroupType>>;
// type PropTypes = {
//   query: StateType[0];
//   setQuery: StateType[1];
// };
export default function ContrastQueryBuilder({
  onSqlChange,
}: {
  onSqlChange: (sql: string) => void;
}) {
  const [query, setQuery] = useState<RuleGroupType>(emptyQuery);
  function handleQueryChange(newQuery: RuleGroupType) {
    setQuery(newQuery);
    const sql = formatQuery(newQuery, "sql");
    onSqlChange(sql);
  }
  return (
    <Box width="100%">
      <QueryBuilderMaterial>
        <QueryBuilder
          fields={fields}
          query={query}
          onQueryChange={handleQueryChange}
          operators={tagQueryOperators}
        />
      </QueryBuilderMaterial>
    </Box>
  );
}
