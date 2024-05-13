import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import { useEffect, useState } from "preact/compat";
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

function TagPathFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tagLikeFilter = searchParams.get("tagLike") || "";
  return (
    <TextField
      fullWidth
      id="tag-filter"
      name="tag-filter"
      label="Filter Tags"
      sx={{ my: 1 }}
      inputProps={{
        "aria-label": "tag filter",
      }}
      width="100%"
      value={tagLikeFilter}
      onChange={(e: InputEvent) => {
        const newValue = (e.target as HTMLInputElement).value.trimStart();
        setSearchParams((sp) => {
          if (newValue === "") {
            sp.delete("tagLike");
          } else {
            sp.set("tagLike", newValue);
          }
          return sp;
        });
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
      setExpandedItems((prev) => [...new Set(prev.concat(family))]);
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
    setExpandedItems(itemIds);
  };
  const handleExpandClick = () => {
    const allNodeIds = allTags.reduce((acc: string[], tag: Taguette.Tag) => {
      const morePaths = getAllPartialPaths(tag.path);
      acc.push(...morePaths);
      return acc;
    }, []);
    setExpandedItems((oldExpanded) =>
      oldExpanded.length === 0 ? allNodeIds : []
    );
  };

  return (
    <Paper
      elevation={1}
      component={Stack}
      sx={{ p: 2 }}
      spacing={2}
      direction="column"
      alignItems="flex-start"
      // minHeight="100vh"
    >
      <CreateTagForm />
      {/* <Typography variant="body2">
        {numTagsSelected > 0
          ? `${numTagsSelected} tag${numTagsSelected > 1 ? "s" : ""} selected`
          : "No tags selected"}
      </Typography> */}
      <Stack direction="row" alignSelf={"stretch"}>
        <Stack
          direction="row"
          spacing={0}
          justifyContent="space-between"
          sx={{
            overflow: "auto",
            // resize: "horizontal",
            //both
            resize: "both",
            // minHeight: "50vh",
            width: "fit-content",
          }}
        >
          <SimpleTreeView
            sx={{
              flexGrow: 1,
              overflow: "auto",
              paddingRight: 1,
            }}
            selectedItems={selectedItems}
            apiRef={apiRef}
            onSelectedItemsChange={handleSelectedItemsChange}
            onItemSelectionToggle={selectChildrenToo}
            multiSelect
            expandedItems={allItemIds(allTags)}
            onExpandedItemsChange={handleExpandedItemsChange}
          >
            <TagPathFilter />
            <MultipleTagTreeItems tags={allTags} level={-1} />
          </SimpleTreeView>
          <Divider orientation="vertical" flexItem />
        </Stack>
        <Box flexGrow={1}>
          <HighlightList />
        </Box>
      </Stack>
    </Paper>
  );
}

function allItemIds(tags: Taguette.Tag[]): string[] {
  return tags.reduce((acc: string[], tag: Taguette.Tag) => {
    const morePaths = getAllPartialPaths(tag.path);
    acc.push(...morePaths);
    return acc;
  }, []);
}
