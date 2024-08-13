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

// import { AutocompleteTextbox } from "react-ghost-text";
type CallerOption = Taguette.Tag;
// type InternalOption = Viewette.SlowTagTree.Item;
// type InternalOption = string;
type Option = CallerOption;
// Multiple extends boolean | undefined, DisableClearable extends boolean | undefined, FreeSolo extends boolean | undefined,
type PropTypes = {
  //   onChange: (event: any, value: any) => void;
  //   label: string;
  //   options: [number, string][];
  value: Option | Option[];
  setValue: (value: Option | Option[]) => void;
  //   disabled?: boolean;
} & Partial<AutocompleteProps<Option, false | true, false, false>>;
type AutocompleteState = AutocompleteOwnerState<
  Option,
  false | true,
  false,
  true
>;

export function TagAutocomplete(props: PropTypes) {
  let { value, setValue, label, multiple, ...rest } = props;
  //   const [value, setValue] = useState<Option | Option[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const { loading } = useLoadingContext();
  const model = (db: TaguetteDb) => () => {
    return db.read.tags();
  };

  const initalValue: Taguette.Tag[] = [];
  const dependencies: any[] = [loading];
  const tags = useModel<Taguette.Tag[]>(initalValue, model, dependencies);
  const itemPaths = getAllItemPaths(tags);
  function optionsFilter(option: Option) {
    const keep = option.path
      .toLocaleLowerCase()
      .includes(inputValue.toLocaleLowerCase());
    return keep;
    const inputValueParts = getTagParts(inputValue);
    const optionParts = getTagParts(option.path);
    return keep && optionParts.length <= inputValueParts.length + 1;
  }
  //   const options = itemPaths.filter(optionsFilter);

  const renderOption = (
    props: Object,
    option: Option,
    _state: unknown,
    _ownerState: unknown
  ) => {
    // first look for a tag in tags where the path matches the option,
    const tag: Taguette.Tag | undefined = tags.find(
      (tag) => tag.path === option.path
    );
    return (
      <li {...props}>
        <TagChip
          tag={option.path}
          sx={{ width: "max-content" }}
          specialColor={!tag}
        />
      </li>
    );
  };
  const renderTags = (
    tagValue: Option[],
    getTagProps: AutocompleteRenderGetTagProps
  ) =>
    tagValue.map((option: Option, index: number) => {
      // console.log("props", getTagProps({ index }))
      const { onDelete, ...rest } = getTagProps({ index });
      return (
        <Stack
          {...getTagProps({ index })}
          direction="row"
          flexWrap="nowrap"
          alignItems="center"
          spacing={0.5}
          sx={{ p: 0.75, borderRadius: "0.5rem" }}
        >
          <TagChip tag={option.path} />
          <IconButton aria-label="remove" onClick={onDelete}>
            <ClearIcon sx={{ fontSize: "1rem" }}></ClearIcon>
          </IconButton>
        </Stack>
      );
    });
  function filterOptions(options: Option[], state: FilterOptionsState<Option>) {
    return options.filter(optionsFilter);
  }
  function onChange(event: Event, newValue: Option[] | Option | null) {
    // console.log("onChange", newValue);
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
    filterOptions,
    value,
    renderInput,
    renderOption,
    renderTags,
    filterSelectedOptions: true,
    ...rest,
  };
  //   return (
  //     <AutocompleteTextbox
  //       getSuggestion={getSuggestion}
  //       //   onContentChange={params.inputProps.onChange}
  //     />
  //   );
  return (
    <Autocomplete
      {...acProps}
      options={tags}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      getOptionLabel={({ path }: Option) => path || ""}
      isOptionEqualToValue={(option: Option, value) =>
        option?.path === value?.path
      }
    />
  );
}
