import * as React from "react";
import { useEffect } from "react";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import {
  tags,
  tagIncludeFilter,
  tagExcludeFilter,
  tagRequirementFilter,
} from "../signals/Filesystems";
import Switch from "@mui/material/Switch";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { cons } from "fp-ts/lib/ReadonlyNonEmptyArray";

function extractTagFilters(searchParam: string): { Λ: number[], V: number[], E: number[] } | null {
  const [Λ, V, E] = [[], [], []];
  const obj = () => ({ Λ, V, E });
  const validatorRegex: RegExp = /(?:[ΛVE]\d+)+$/;
  const matcherRegex: RegExp = /([ΛVE])(\d+)/g;
  // const testString = "V8Λ69-4-44";
  const isValid = validatorRegex.test(searchParam);
  if (!isValid) {
    return null;
  }
  const matches = [...searchParam.matchAll(matcherRegex)].map((m) => m.slice(1, 3 + 1)) as ["E" | "V" | "Λ", number][]; // [operator, id]
  // console.log(matches);
  for (const match of matches) {
    let [operator, id] = match;
    switch (operator) {
      case "V":
        V.push(id);
        break;
      case "Λ":
        Λ.push(id);
        break;
      case "E":
        E.push(id);
        break;
      default:
        break;
    }
  }
  // console.log(obj());
  return obj();
}
function generateTagFilters({ Λ, V, E }: { Λ: number[], V: number[], E: number[] }) {
  const intersectStr = Λ.map((id) => `Λ${id}`).join("");
  const unionStr = V.map((id) => `V${id}`).join("");
  const excludeStr = E.map((id) => `E${id}`).join("");
  return intersectStr + unionStr + excludeStr;
}

export function TagAutocomplete(props: {
  which: "V" | "Λ" | "E", tagSignal: typeof tags,
  filterSignal: typeof tagIncludeFilter | typeof tagRequirementFilter | typeof tagExcludeFilter
}) {
  const { which, tagSignal, filterSignal } = props;
  const [params, setParams] = useSearchParams();
  let tagParam = params.get("tags");
  useEffect(() => {
    const filters = extractTagFilters(tagParam!) ?? { Λ: [], V: [], E: [] };
    filterSignal.value = filters[which].map((v) => Number(v));
    if (tagParam !== null && extractTagFilters(tagParam) === null) {
      params.delete("tags");
      setParams(params, { replace: true });
    }
  }, [tagParam]);

  function onChange(_, newVal: string[]) {
    const filters = extractTagFilters(tagParam!) ?? { Λ: [], V: [], E: [] };
    filters[which] = newVal as unknown as number[];
    setParams({ tags: generateTagFilters(filters) }, { replace: true });

  }
  const labels = {
    V: "Require Any Tag",
    Λ: "Require All Tags",
    E: "Exclude Tags",
  };
  return <Autocomplete
    options={Object.keys(tagSignal.value)}
    value={(extractTagFilters(tagParam!)?.[which] ?? []).map((id) => id.toString())}
    onChange={onChange}
    getOptionLabel={id => (tagSignal.value as Record<number, string>)[Number(id)]}
    isOptionEqualToValue={(option, value) => value === option}
    renderInput={(params) => <TextField {...params} label={labels[which]} />}
    multiple
    filterSelectedOptions
  />;
}


export function TagFilters() {
  return <Stack spacing={2} alignItems={"stretch"}>
    <TagAutocomplete which="E" tagSignal={tags} filterSignal={tagExcludeFilter} />
    <TagAutocomplete which="Λ" tagSignal={tags} filterSignal={tagRequirementFilter} />
    <TagAutocomplete which="V" tagSignal={tags} filterSignal={tagIncludeFilter} />
  </Stack>;

}

export function IncludeTags({ tagSignal }: { tagSignal: typeof tags }) {
  const [all, setAll] = React.useState(true);
  React.useEffect(() => {
    if (all) {
      tagRequirementFilter.value = tagIncludeFilter.value;
      tagIncludeFilter.value = [];
    } else {
      tagIncludeFilter.value = tagRequirementFilter.value;
      tagRequirementFilter.value = [];
    }
  }, [all]);
  const onChange = (event, value) => {
    if (all) {
      // tagRequirementFilter.value = value = value.map((v) => Number(v[0]));
    } else {
      // tagIncludeFilter.value = value = value.map((v) => Number(v[0]));
    }
  };
  const label = all ? "Require All Tags" : "Require Any Tag";
  const which = all ? "Λ" : "V";
  return (
    <Stack direction="row" spacing={1} alignItems={"center"}>
      <Box sx={{ flexGrow: 1 }}>
        {/* <Filter onChange={onChange} label={label} /> */}
        <TagAutocomplete which={which} tagSignal={tagSignal} />
      </Box>
      {/* <Typography aria-label="All">All?</Typography> */}
      <Switch
        checked={all}
        onChange={(e) => setAll(e.target.checked)}
        aria-label="Toggle between requiring any tag or all tags"
      />
    </Stack>
  );
}
