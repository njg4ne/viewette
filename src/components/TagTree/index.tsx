
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import { useEffect, useState } from "react";
import { opfsDb } from "../../signals";
import { Typography } from "@mui/material";
import { useTreeViewApiRef } from "@mui/x-tree-view";
import { useLoadingContext, LoadingProvider } from "./contexts/Loading";
import { useTreeContext, TreeProvider } from "./contexts/Tree";
import {
  getAllPartialPaths,
  getGenealogy,
} from "./utils";
import { RenderTagItems } from "./TreeItem";
import CreateTagForm from "./CreateTagForm";

export default function TagTreeWithContext() {
  return (
    <LoadingProvider>
      <TreeProvider>
        <TagTree />
      </TreeProvider>
    </LoadingProvider>
  );
}

export function TagTree({ }) {
  const [tags, setTags] = useState<Record<string, string>>({});
  const {
    expandedItems,
    setExpandedItems,
    selectedItems,
    setSelectedItems,
  } = useTreeContext();
  const apiRef = useTreeViewApiRef();
  const { loading, setLoading } = useLoadingContext();
  const numNodesSelected = selectedItems.length;

  useEffect(() => {
    if (loading) return;
    const task = opfsDb.value?.getTags();
    task?.then((res: unknown) => {
      setTags(res as Record<string, string>);
    });
    return () => { };
  }, [opfsDb.value, loading]);
  const handleSelectedItemsChange = (event: Event, itemIds: string[]) => {
    // console.log("change")
    // apiRef.current?.focusItem(event, itemIds.at(0)!);
    // setSelectedItems(itemIds);
  };
  const selectChildrenToo = (event: Event, itemId: string, isSelected: boolean): void => {

    const family = getGenealogy([itemId], tags);
    if (isSelected) {
      setExpandedItems(prev => [...new Set(prev.concat(family))]);
      setSelectedItems(prev => [...new Set(prev.concat(family))]);
      // apiRef.current?.focusItem(event, itemId);
    }
    else {
      setSelectedItems(prev => prev.filter(id => !family.includes(id)));

    }
    // console.log("setting")
  }
  const handleExpandedItemsChange = (event: Event, itemIds: string[]) => {
    setExpandedItems(itemIds);
  };
  const handleExpandClick = () => {
    const allNodeIds = Object.entries(tags).reduce((acc: string[], [id, path]) => {
      const morePaths = getAllPartialPaths(path);
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
      sx={{ p: 2, }}
      spacing={2}
      direction="column"
      alignItems="flex-start"
    >
      <CreateTagForm />
      <Typography variant="body2" >
        {numNodesSelected > 0 ? `${numNodesSelected} tag${numNodesSelected > 1 ? "s" : ""} selected` : "No tags selected"}
      </Typography>
      <Button onClick={handleExpandClick} variant="contained" color="secondary">
        {expandedItems.length === 0 ? "Expand All" : "Collapse All"}
      </Button>
      <SimpleTreeView
        key={Date.now().toString()}
        selectedItems={selectedItems}
        apiRef={apiRef}
        onSelectedItemsChange={handleSelectedItemsChange}
        onItemSelectionToggle={selectChildrenToo}
        sx={{ maxWidth: "100%" }}
        multiSelect
        expandedItems={expandedItems}
        onExpandedItemsChange={handleExpandedItemsChange}
      >
        {tags && <RenderTagItems tags={Object.entries(tags)} level={-1} />}
      </SimpleTreeView>
    </Paper>
  );
}


