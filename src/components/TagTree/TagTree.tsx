import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import { useEffect, useState } from "react";
import { opfsDb } from "../../signals";
// import { Box, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTreeViewApiRef } from "@mui/x-tree-view";
import { useLoadingContext } from "./contexts/LoadingContext";
import { useTreeContext } from "./contexts/TagTreeContext";
import { getAllPartialPaths, getGenealogy, getTopLevelTags } from "./utils";
import MultipleTagTreeItems from "./Items/MultipleTagTreeItems";
import MultipleTagTreeItems2 from "./Items/MultipleTagTreeItems";
import CreateTagForm from "./CreateTagForm";
import HighlightList from "../HighlightList";
import AcUnitIcon from "@mui/icons-material/AcUnit";
export default function TagTree({}) {
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
    >
      <CreateTagForm />
      <Typography variant="body2">
        {numTagsSelected > 0
          ? `${numTagsSelected} tag${numTagsSelected > 1 ? "s" : ""} selected`
          : "No tags selected"}
      </Typography>
      {/* <Button onClick={handleExpandClick} variant="contained" color="secondary">
        {expandedItems.length === 0 ? "Expand All" : "Collapse All"}
      </Button> */}
      <Stack direction="row" sx={{ alignSelf: "stretch" }}>
        <Box
          sx={{
            flexGrow: 0,
            overflow: "auto",
            resize: "horizontal",
            // minWidth: "fit-content",
            paddingRight: 1,
          }}
        >
          <SimpleTreeView
            // autoFocus={false}
            // key={Date.now().toString()}
            selectedItems={selectedItems}
            apiRef={apiRef}
            onSelectedItemsChange={handleSelectedItemsChange}
            onItemSelectionToggle={selectChildrenToo}
            // sx={{ maxWidth: "50%" }}
            multiSelect
            expandedItems={allItemIds(allTags)}
            onExpandedItemsChange={handleExpandedItemsChange}
          >
            {/* {tags && (
              <MultipleTagTreeItems tags={Object.entries(tags)} level={-1} />
            )} */}
            <MultipleTagTreeItems2 tags={allTags} level={-1} />
          </SimpleTreeView>
        </Box>
        <Box
          sx={{
            // height: "100vh",
            // bgcolor: "orange",
            overflow: "auto",
            // resize: "horizontal",
            // width: "100%",
            flexGrow: 1,
          }}
        >
          {/* <HighlightList></HighlightList> */}
          {/* highlights */}
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
