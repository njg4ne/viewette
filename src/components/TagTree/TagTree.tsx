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
import MultipleTagTreeItems, {
  TagTreeItem,
} from "./TagTreeItems/MultipleTagTreeItems";
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
import {
  Active,
  DndContext,
  DragOverlay,
  pointerWithin,
  rectIntersection,
} from "@dnd-kit/core";
import { DroppableContainer, RectMap } from "@dnd-kit/core/dist/store/types";
import { Coordinates } from "@dnd-kit/core/dist/types";
import { Rect } from "@dnd-kit/core/dist/utilities";

import TagFamilyPreview from "./TagFamilyPreview";
import { useModalContext } from "../../contexts/ModalContext";
import { TagChip } from "../TagChip";
import { persistMerge, persistNest } from "./TagTreeItems/MergeMenuItem";
import { dbs, signalReady } from "../../signals";
import { useSnackbar } from "notistack";
import * as popups from "../../popups";
import Dnd from "./TagTree2/Dnd";
import QueryBuilder from "../TagQueryBuilder";
function customCollisionDetectionAlgorithm(args: {
  active: Active;
  collisionRect: Rect;
  droppableRects: RectMap;
  droppableContainers: DroppableContainer[];
  pointerCoordinates: Coordinates | null;
}) {
  // const { active, collisionRect, droppableRects, droppableContainers } = args;
  // const { id, data } = active;
  // const { item: draggedItem } = data.current;
  // console.log(`id: ${id}, data:`, draggedItem, args);
  // First, let's see if there are any collisions with the pointer
  const pointerCollisions = pointerWithin(args);
  // Collision detection algorithms return an array of collisions
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }
  // If there are no collisions with the pointer, return rectangle intersections
  return rectIntersection(args);
}
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
  const { enqueueSnackbar: sbqr } = useSnackbar();

  const { setModalActions } = useModalContext();
  const { loading, setLoading } = useLoadingContext();
  const {
    allTags,
    expandedItems,
    // setExpandedItems,
    selectedItems,
    setSelectedItems,
    apiRef,
    // numTagsSelected,
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
  const [itemBeingDragged, setItemBeingDragged] = useState<TagTreeItem | null>(
    null
  );
  null;

  function queueCombine(srcItem: TagTreeItem, destPath: string) {
    const srcPath = srcItem?.path;
    if (destPath.startsWith(srcPath)) {
      return;
    }
    const mergeMsg = CombineTagsMsg({
      srcPath,
      destPath,
      before: "Merge",
      between: "into",
    });
    const nestMsg = CombineTagsMsg({
      srcPath,
      destPath,
      before: "Nest",
      between: "under",
    });
    const callbackFactory = (combiner: any, successMsg: string) => () => {
      if (loading || !srcItem || !signalReady(dbs)) return;
      setLoading(true);
      combiner(dbs.value, srcItem, destPath).then(() => {
        popups.success(sbqr, successMsg);
        setLoading(false);
      });
    };

    const actions = {
      merge: [
        mergeMsg,
        callbackFactory(persistMerge, `Merged ${srcPath} into ${destPath}`),
      ],
      nest: [
        nestMsg,
        callbackFactory(persistNest, `Nested ${srcPath} under ${destPath}`),
      ],
    };
    setModalActions(actions);
  }

  function queueAddTagToHighlight(
    tag: Taguette.Tag,
    highlight: Taguette.Highlight
  ) {
    if (highlight.tags.includes(tag.path)) {
      return;
    }
    const tagAction = () => {
      if (loading || !signalReady(dbs)) return;
      setLoading(true);
      dbs.value.update.tags
        .forHighlight(highlight.id, [], [tag.id])
        .then(() => {
          popups.success(sbqr, `Added ${tag.path} to hl id ${highlight.id}`);
          setLoading(false);
        });
    };
    const node = (
      <Stack
        width="max-content"
        direction="row"
        spacing={1}
        alignItems="center"
      >
        <Typography>Add</Typography> <TagChip tag={tag.path} />
        <Typography>to highlight ID {highlight.id}</Typography>
      </Stack>
    );
    const actions = {
      add: [node, tagAction],
    };
    setModalActions(actions);
  }

  function handleDragEnd(event: Event & any) {
    setItemBeingDragged(null);
    const srcItem = event.active?.data?.current?.item;
    const destTagPath = event.over?.data?.current?.item?.path;
    const srcTag = event.active?.data?.current?.item?.tag;
    const destHl = event.over?.data?.current?.highlight;
    if (srcItem && destTagPath && srcItem.path) {
      queueCombine(srcItem, destTagPath);
    } else if (srcItem && destHl) {
      if (srcTag) {
        queueAddTagToHighlight(srcTag, destHl);
      } else {
        popups.error(sbqr, "Cannot add category to a highlight");
      }
    }
  }
  function handleDragStart(event: Event & any) {
    setItemBeingDragged(event.active?.data?.current?.item);
  }

  return (
    <Dnd>
      <Paper
        elevation={1}
        component={Stack}
        sx={{ p: 2, height: "100%", overflow: "auto" }}
        spacing={2}
        direction="column"
      >
        <Stack direction="row" flexGrow={1}>
          <Box maxWidth="50%">
            <AutoSizer disableWidth>
              {({ height }) => (
                <SimpleTreeView
                  sx={{
                    resize: "horizontal",
                    maxWidth: "100%",
                    height,
                    flexGrow: 1,
                    overflow: "auto",
                    paddingRight: 1,
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
                  <CreateTagForm />
                  <MultipleTagTreeItems tags={allTags} level={-1} />
                </SimpleTreeView>
              )}
            </AutoSizer>
          </Box>
          <Box flexGrow={1}>
            <HighlightsProvider>
              <HighlightList />
            </HighlightsProvider>
          </Box>
        </Stack>
      </Paper>
    </Dnd>
  );
}
function CombineTagsMsg({
  srcPath,
  destPath,
  before,
  between,
}: {
  srcPath: string;
  destPath: string;
  before: string;
  between: string;
}) {
  return (
    <Stack width="max-content" direction="row" spacing={1} alignItems="center">
      <Typography>{before}</Typography> <TagChip tag={srcPath} />
      <Typography>{between}</Typography>
      <TagChip tag={destPath} />
    </Stack>
  );
}
