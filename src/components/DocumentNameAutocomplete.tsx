import * as React from "preact/compat";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Autocomplete from "@mui/material/Autocomplete";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import ClearIcon from "@mui/icons-material/Clear";
import { TagChip } from "./TagChip";
import type {
  AutocompleteProps,
  AutocompleteOwnerState,
  AutocompleteRenderOptionState,
  AutocompleteRenderGetTagProps,
  AutocompleteRenderInputParams,
} from "@mui/material/Autocomplete";
import IconButton from "@mui/material/IconButton";
import { useLoadingContext } from "../contexts/LoadingContext";
import type { TaguetteDb } from "../db";
import { useModel } from "../hooks";
import { useState, useCallback } from "preact/hooks";
import { getAllItemPaths } from "../utils/tagTreeUtils";
import { TagTreeItem } from "./TagTree/TagTreeItems/MultipleTagTreeItems";
import { getTagParts, SEPARATOR } from "./TagTree/utils";
import { FilterOptionsState } from "@mui/material/useAutocomplete";

type Option = Partial<Taguette.Document>;
type PropTypes = {
  value: Option | Option[];
  setValue: (value: Option | Option[]) => void;
} & Partial<AutocompleteProps<Option, false | true, false, false>>;
type AutocompleteState = AutocompleteOwnerState<
  Option,
  false | true,
  false,
  true
>;

export function DocumentNameAutocomplete(props: PropTypes) {
  let { value, setValue, label, multiple, ...rest } = props;
  const [inputValue, setInputValue] = useState<string>("");
  const { loading } = useLoadingContext();
  const model = (db: TaguetteDb) => () => {
    return db.read.documents();
  };

  const initalValue: Taguette.Tag[] = [];
  const dependencies: any[] = [loading];
  const docs = useModel<Partial<Taguette.Document>[]>(
    initalValue,
    model,
    dependencies
  );
  function onChange(event: Event, newValue: Option[] | Option | null) {
    setValue(newValue || []);
  }
  function renderInput(params: AutocompleteRenderInputParams) {
    return (
      <TextField
        variant="standard"
        {...(params as TextFieldProps)}
        // color="secondary"
        hiddenLabel
        // label={label || multiple ? "Tags" : "Tag"}
      />
    );
  }
  const acProps = {
    multiple,
    onChange,
    value,
    renderInput,
    filterSelectedOptions: true,
    ...rest,
  };
  return (
    <Autocomplete
      {...acProps}
      options={docs}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      getOptionLabel={({ name }: Option) => name || ""}
      isOptionEqualToValue={(option: Option, value) =>
        option?.name === value?.name
      }
    />
  );
}
