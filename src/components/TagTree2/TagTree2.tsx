import { useEffect, useMemo, useState } from "preact/hooks";
import { SEPARATOR, getTagParts } from "../../utils/tagTreeUtils";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import TagTreeItem from "./TagTreeItem";

// import { Dnd } from "./Dnd";
import { TreeItem2Props, useTreeViewApiRef } from "@mui/x-tree-view";
// import { forwardRef, memo } from "preact/compat";
// import { RichTreeViewRoot } from "@mui/x-tree-view";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import {
  OpfsDbContextProvider,
  useOpfsDbContext,
} from "../../contexts/OpfsDbContext";
export default function TreeView2() {
  const apiRef = useTreeViewApiRef();
  const tags = useTags();
  const branches = useMemo(() => getBranches(tags, 0), [tags]);
  const allItemIds = useMemo(() => getAllItemIds(branches), [branches]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  useEffect(() => {
    setExpandedItems(allItemIds);
  }, [allItemIds]);
  const handleExpandedItemsChange = (event: Event, itemIds: string[]) => {
    setExpandedItems(itemIds);
  };
  const handleSelectedItemsChange = (event: Event, itemIds: string[]) => {
    console.log("selected", itemIds);
    setSelectedItems(itemIds);
  };
  const handleToggleSelection = (
    event: Event,
    itemId: string,
    isSelected: boolean
  ) => {
    const item = apiRef.current?.getItem(itemId);
    const relevant = getAllItemIds([item as Viewette.TagTree.Item]);
    setSelectedItems((prev) =>
      isSelected
        ? [...prev, itemId, ...relevant]
        : prev.filter((id) => !relevant.includes(id))
    );
  };

  return (
    <Paper
      elevation={1}
      component={Stack}
      sx={{ p: 2, height: "100%" }}
      spacing={2}
      direction="column"
      // alignItems="flex-start"
      // minHeight="100vh"
    >
      <Box
        sx={{
          height: "100%",
          overflow: "auto",
          width: "max-content",
          resize: "horizontal",
        }}
      >
        {/* <Dnd> */}
        <RichTreeView
          multiSelect
          // checkboxSelection
          expandedItems={expandedItems}
          selectedItems={selectedItems}
          onExpandedItemsChange={handleExpandedItemsChange}
          // onSelectedItemsChange={handleSelectedItemsChange}
          onItemSelectionToggle={handleToggleSelection}
          items={branches}
          getItemId={(itm) => itm.path}
          slots={{
            item: (props: TreeItem2Props) => (
              <TagTreeItem {...props} apiRef={apiRef} />
            ),
            // root: Root,
          }}
          apiRef={apiRef}
        />
        {/* </Dnd> */}
      </Box>

      {/* <Virtuoso
      
        // ref={virtuosoRef}
        data={allItemIds}
        // totalCount={numHlts}
        itemContent={(index, value) => value}
        // rangeChanged={onRange}
        // initialTopMostItemIndex={Number(hlOffset)}
      /> */}
    </Paper>
  );
  return <Box sx={{ minHeight: 352, minWidth: 250 }}></Box>;
}

export function useBranchedTags() {
  const tags = useTags();
  const branches = useMemo(() => getBranches(tags, 0), [tags]);
  return branches;
}

function useTags() {
  const [tags, setTags] = useState<Taguette.Tag[]>([]);
  const db = useOpfsDbContext();
  if (!db) return [];
  useEffect(() => {
    fetchTags(db).then(([newTags]) => {
      if (!newTags) return;
      setTags(newTags as Taguette.Tag[]);
    });
  }, []);
  return tags;
}
async function fetchTags(db: OpfsDb) {
  await db.ready;
  const sql = `SELECT * FROM tags;`;
  return await db.transactAll([{ sql }]);
}

export function getAllItemIds(branches: Viewette.TagTree.Item[]): string[] {
  const res = branches.flatMap((branch) => {
    const paths = [branch.path];
    if (branch.children) {
      paths.push(...getAllItemIds(branch.children));
    }
    return paths;
  });
  //   console.log(res);
  return res;
}

function getBranches(
  tags: Taguette.Tag[],
  level: number,
  prefix: string = ""
): any[] {
  if (tags.length === 0) {
    return [];
  }
  //   @ts-ignore
  const groups = Object.groupBy(tags, (tag: Taguette.Tag) =>
    getTagParts(tag.path).at(level)
  );
  type Entry = [string, Taguette.Tag[] | undefined];
  const entries = Object.entries(groups) as Entry[];
  return entries.map(([label, familyTags]) => {
    familyTags = familyTags || [];
    const path = prefix + label;
    const parent = familyTags.find((tag) => tag.path === path);
    const childTags = familyTags.filter((tag) => tag.path !== path);
    const children = getBranches(childTags, level + 1, path + SEPARATOR);
    // const familyTags = getAllItemIds(children);
    return {
      //   id: path,
      label,
      content: <Typography>{label}</Typography>,
      path,
      level,
      selected: false,
      expanded: false,
      children,
      familyTags,
      tag: parent,
      isTag: !!parent,
    } as Viewette.TagTree.Item;
  });
}
