import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import { useEffect, useState } from "react";
import { opfsDb } from "../../signals";
import { Typography } from "@mui/material";
import { useTreeViewApiRef } from "@mui/x-tree-view";
import { useLoadingContext } from "./contexts/Loading";
import { useTreeContext } from "./contexts/Tree";
import { getAllPartialPaths, getGenealogy, getTopLevelTags } from "./utils";
import MultipleTagTreeItems from "./Items/Multiple";
import CreateTagForm from "./CreateTagForm";

export default function TagTree({}) {
  const {
    expandedItems,
    setExpandedItems,
    selectedItems,
    setSelectedItems,
    tags,
    setTags,
    numTagsSelected,
    apiRef,
  } = useTreeContext();

  const { loading, setLoading } = useLoadingContext();

  useEffect(() => {
    if (loading) return;
    const task = opfsDb.value?.getTags();
    task?.then((newTags: Record<string, string>) => {
      setTags(newTags);
      setSelectedItems((prev) =>
        prev.filter((path) => Object.values(newTags).includes(path))
      );
      // setExpandedItems((prev) => {
      //   const tlts = getTopLevelTags(newTags);
      //   const family = getGenealogy(tlts, newTags);
      //   console.log(tlts, family);
      //   console.log(prev);
      //   return prev.filter((path) => family.includes(path));
      // });
    });
    // filter any tags from selectedItems in the selectedItems state that died, including dead ancestors

    return () => {};
  }, [opfsDb.value, loading]);
  const handleSelectedItemsChange = (event: Event, itemIds: string[]) => {
    // console.log("change")
    // apiRef.current?.focusItem(event, itemIds.at(0)!);
    // setSelectedItems(itemIds);
  };
  const selectChildrenToo = (
    event: Event,
    itemId: string,
    isSelected: boolean
  ): void => {
    const family = getGenealogy([itemId], tags);
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
    const allNodeIds = Object.entries(tags).reduce(
      (acc: string[], [id, path]) => {
        const morePaths = getAllPartialPaths(path);
        acc.push(...morePaths);
        return acc;
      },
      []
    );
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
      <Button onClick={handleExpandClick} variant="contained" color="secondary">
        {expandedItems.length === 0 ? "Expand All" : "Collapse All"}
      </Button>
      <SimpleTreeView
        // autoFocus={false}
        // key={Date.now().toString()}
        selectedItems={selectedItems}
        apiRef={apiRef}
        onSelectedItemsChange={handleSelectedItemsChange}
        onItemSelectionToggle={selectChildrenToo}
        sx={{ maxWidth: "100%" }}
        multiSelect
        expandedItems={expandedItems}
        onExpandedItemsChange={handleExpandedItemsChange}
      >
        {tags && (
          <MultipleTagTreeItems tags={Object.entries(tags)} level={-1} />
        )}
      </SimpleTreeView>
    </Paper>
  );
}
