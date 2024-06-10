import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import { useEffect, useRef, useState } from "preact/compat";
// import { opfsDb } from "../../signals";
// import { Box, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { useTreeViewApiRef } from "@mui/x-tree-view";
import { useLoadingContext } from "../../contexts/LoadingContext";
import { useTreeContext } from "../../contexts/TagTreeContext";
import { getAllPartialPaths, getGenealogy, getTopLevelTags } from "./utils";
import MultipleTagTreeItems from "./TagTreeItems/MultipleTagTreeItems";
import CreateTagForm from "./CreateTagForm";
// import VirtualList from "../VirtualList";
// import HighlightList from "../Parent";
import HighlightList from "../HighlightList";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import TextField from "@mui/material/TextField";
import { useSearchParams } from "react-router-dom";
import { HighlightsProvider } from "../../contexts/HighlightsContext";
// import { AutoSizer } from "react-virtualized";
import AutoSizer from "react-virtualized-auto-sizer";
// import { useDebounce } from "use-debounce";
import { useDebouncedCallback } from "use-debounce";
import useDebouncedSearchParam from "../../hooks/useDebouncedSearchParam";
import {
  SearchParamProvider,
  useSearchParamContext,
} from "../../contexts/SearchParamContext";
const SEARCH_KEY = "tagLike";
function TagPathFilter() {
  // const [inputValue, setInputValue] = useDebouncedSearchParam({
  //   key: SEARCH_KEY,
  // });

  const [param, onChangeDebounced] = useSearchParamContext(SEARCH_KEY);
  const [inputValue, setInputValue] = useState(param);
  useEffect(() => {
    setInputValue(param);
  }, [param]);

  return (
    <TextField
      fullWidth
      // inputRef={inputRef}
      id="tag-filter"
      name="tag-filter"
      label="Filter Tags"
      sx={{ my: 1 }}
      inputProps={{
        "aria-label": "tag filter",
      }}
      // disabled={loading}
      width="100%"
      value={inputValue}
      onChange={(e: Event) => {
        const newValue = (e.target as HTMLInputElement).value.trimStart();
        setInputValue(newValue);
        onChangeDebounced(newValue);
      }}
    />
  );
}

export default function TagTree({}) {
  // useEffect(() => {}, [searchParams.get("tagLike")]);
  // useEffect(() => {
  //   console.log("App Container");
  //   let utterance = new SpeechSynthesisUtterance("I am working very hard");

  //   window.speechSynthesis.speak(utterance);
  //   // }
  // }, []);
  const { loading, setLoading } = useLoadingContext();
  const {
    allTags,
    expandedItems,
    setExpandedItems,
    selectedItems,
    setSelectedItems,
    apiRef,
    numTagsSelected,
  } = useTreeContext();
  // const numTagsSelected = selectedItems.length || 0;
  const handleSelectedItemsChange = (event: Event, itemIds: string[]) => {
    // do nothing
  };
  const selectChildrenToo = (
    event: Event,
    itemId: string,
    isSelected: boolean
  ): void => {
    const family = getGenealogy([itemId], allTags);
    if (isSelected) {
      // setExpandedItems((prev) => [...new Set(prev.concat(family))]);
      setSelectedItems((prev) => [...new Set(prev.concat(family))]);
      // apiRef.current?.focusItem(event, itemId);
    } else {
      setSelectedItems((prev) => prev.filter((id) => !family.includes(id)));
      // just filter self
      // setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    }
    // console.log("setting")
  };
  const handleExpandedItemsChange = (event: Event, itemIds: string[]) => {
    // setExpandedItems(itemIds);
  };
  const handleExpandClick = () => {
    // const allNodeIds = allTags.reduce((acc: string[], tag: Taguette.Tag) => {
    //   const morePaths = getAllPartialPaths(tag.path);
    //   acc.push(...morePaths);
    //   return acc;
    // }, []);
    // setExpandedItems((oldExpanded) =>
    //   oldExpanded.length === 0 ? allNodeIds : []
    // );
  };
  return (
    // <SearchParamProvider keys={["newTag"]}>
    <Paper
      elevation={1}
      component={Stack}
      sx={{ p: 2, height: "100%", overflow: "auto" }}
      spacing={2}
      direction="column"
      // alignItems="flex-start"
      // minHeight="100vh"
    >
      <CreateTagForm />
      <Stack direction="row" flexGrow={1}>
        {/* <Box bgcolor="green"> */}
        <Box maxWidth="50%">
          <AutoSizer disableWidth>
            {({ height }) => (
              // <Box sx={{ width, height, bgcolor: "yellow" }} />
              // <Stack direction="row" height={height} width={width}>
              <SimpleTreeView
                sx={{
                  resize: "horizontal",
                  maxWidth: "100%",
                  // width,
                  height,
                  flexGrow: 1,
                  overflow: "auto",
                  paddingRight: 1,
                  // maxHeight: "50vh",
                }}
                selectedItems={selectedItems}
                apiRef={apiRef}
                onSelectedItemsChange={handleSelectedItemsChange}
                onItemSelectionToggle={selectChildrenToo}
                multiSelect
                expandedItems={Array.from(expandedItems.keys())}
                // expandedItems={allItemIds(allTags)}
                // onExpandedItemsChange={handleExpandedItemsChange}
              >
                <TagPathFilter />
                <MultipleTagTreeItems tags={allTags} level={-1} />
              </SimpleTreeView>
              // </Stack>
            )}
          </AutoSizer>
        </Box>
        {/* </Box> */}
        <Box flexGrow={1}>
          <HighlightsProvider>
            <HighlightList />
          </HighlightsProvider>
        </Box>
      </Stack>
    </Paper>
    // </SearchParamProvider>
  );
}
