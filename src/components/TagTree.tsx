// import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useSnackbar } from "notistack";

import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import { opfsDb } from "../signals/Filesystems";
import Chip from "@mui/material/Chip";
type TagEntry = [id: string, path: string];
// type TagEntryExt = [
//   id: string,
//   label: string,
//   partialPath: string,
//   fullPath: string
// ];
export default function TagTree({}) {
  const [tags, setTags] = useState<Record<string, string>>(null);
  const [loading, setLoading] = useState(false);
  useEffect(async () => {
    if (loading) return;
    const task = opfsDb.value?.getTags();
    const res = await task;
    setTags(res);
    return () => {
      task.cancel();
    };
  }, [opfsDb.value, loading]);
  //   useEffect(async () => {
  //     // console.log(tags);
  //   }, [tags]);

  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleExpandedItemsChange = (event: Event, itemIds: string[]) => {
    setExpandedItems(itemIds);
  };

  const handleExpandClick = () => {
    console.log(Object.entries(tags).map((tag) => tag[1]));
    setExpandedItems((oldExpanded) =>
      oldExpanded.length === 0 ? Object.entries(tags).map((tag) => tag[1]) : []
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
      <NewTagForm loading={loading} setLoading={setLoading} />

      <Button onClick={handleExpandClick}>
        {expandedItems.length === 0 ? "Expand All" : "Collapse All"}
      </Button>
      <SimpleTreeView
        multiSelect
        expandedItems={expandedItems}
        onExpandedItemsChange={handleExpandedItemsChange}
      >
        {tags && <RenderTagItems tags={Object.entries(tags)} level={-1} />}
      </SimpleTreeView>
    </Paper>
  );
}

function extend([tagId, fullPath]: TagEntry): TagEntryExt {
  const parts = fullPath.split(SEPARATOR);
  const label = parts.shift();
  return [tagId, label!, parts.join(SEPARATOR), fullPath];
}

type TagTreeItemSetProps = {
  tags: TagEntry[];
  level: number;
};
const SEPARATOR = ".";
function RenderTagItems({ tags, level }: TagTreeItemSetProps) {
  const newLevel = level + 1;
  const onLevel = ([, path]: TagEntry) =>
    path.split(SEPARATOR).length - 1 === newLevel;
  const levelTags = tags.filter(onLevel);
  const isChildOf =
    ([, parentPath]: TagEntry) =>
    ([, path]: TagEntry) =>
      path.startsWith(parentPath) && path !== parentPath;

  return (
    <>
      {levelTags.map((tag) => (
        <RenderOneTag
          key={tag[1]}
          tag={tag}
          tags={tags.filter(isChildOf(tag))}
          level={newLevel}
        />
      ))}
    </>
  );
}
type TagTreeItemProps = {
  tag: TagEntry;
  tags: TagEntry[];
  level: number;
};
function RenderOneTag({ tag, level, tags }: TagTreeItemProps) {
  const [id, path] = tag;
  const parts = path.split(SEPARATOR);
  const label = parts[level];
  return (
    <TreeItem
      itemId={path}
      label={
        <Tooltip title={path} placement="right">
          <Chip
            label={label}
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              borderRadius: 2,
              fontWeight: "medium",
            }}
          />
        </Tooltip>
      }
    >
      <RenderTagItems tags={tags} level={level} />
    </TreeItem>
  );
}
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import ClearIcon from "@mui/icons-material/Clear";
import ButtonGroup from "@mui/material/ButtonGroup";

type NewTagFormProps = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
};
function NewTagForm({ loading, setLoading }: NewTagFormProps) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  return (
    <Paper
      component="form"
      elevation={0}
      sx={{
        p: "2px 4px",
        display: "flex",
        alignItems: "center",
        width: "max-content",
      }}
      onSubmit={async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);

        const formData = new FormData(e.target as HTMLFormElement);
        const newTag = formData.get("newTag") as string;
        if (!newTag) {
          setLoading(false);
          return;
        }
        opfsDb.value
          ?.createTag(newTag)
          .then(
            (newTag) => (
              enqueueSnackbar(`Created tag: '${newTag}'`, {
                variant: "success",
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "right",
                },
              }),
              setLoading(false)
            )
          )
          .catch((e) => {
            enqueueSnackbar(e, {
              variant: "error",
              anchorOrigin: {
                vertical: "bottom",
                horizontal: "right",
              },
            });
            setLoading(false);
          });
        //   alert("create new tag: " + newTag);
      }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="tag.subtag.subsubtag"
        inputProps={{ "aria-label": "add a new tag" }}
        name="newTag"
      />
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
      <IconButton sx={{ p: "10px" }} aria-label="menu" type="reset">
        <ClearIcon />
      </IconButton>

      <IconButton sx={{ p: "10px" }} aria-label="menu" type="submit">
        <AddIcon />
      </IconButton>
    </Paper>
  );
}
