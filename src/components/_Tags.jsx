import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import List from "@mui/material/List";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import RemoveIcon from "@mui/icons-material/Remove";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
// import { updateTagPaths } from "../signals";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

import { useState } from "preact/compat";
import {
  Tree,
  getBackendOptions,
  MultiBackend,
} from "@minoru/react-dnd-treeview";
import { DndProvider } from "react-dnd";

export default function Tags({ tags: tagsSignal }) {
  const tagMap = tagsSignal.value;
  const tagMapEntries = Object.entries(tagMap);
  const tagObjList = tagMapEntries.map(([tagId, tagStr]) => ({
    tagId,
    tagStr,
  }));
  const nodes = nest(tagObjList);
  const dndNodes = nestForReactDndTreeview(tagObjList);
  console.log("DndNodes: ", dndNodes);
  console.log("Nodes: ", nodes);
  return (
    <Stack sx={{ alignItems: "center", py: 2, overflow: "scroll" }} spacing={2}>
      <Typography variant="h4" sx={{ textAlign: "center" }}>
        Tags
      </Typography>
      {/* <TagTree data={nodes} /> */}

      <DndTagTree data={dndNodes} tagMap={tagMap} />

      {/* <Box sx={{ height: "10in", width: "100%" }}>

                <DndTagTree data={dndNodes} />
            </Box> */}
    </Stack>
  );
}

function TagChip({ tag, kind }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Chip
        key={`tag-chip-${tag}`}
        sx={{
          borderRadius: 2,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          // outline: 1
        }}
        label={tag}
      />
      {["directory", "dir", "folder"].includes(kind) ? <FolderIcon /> : null}
      {kind === "file" ? <InsertDriveFileIcon /> : null}
    </Stack>
  );
}

function DndTagTree({ data, tagMap }) {
  const handleDrop = (
    newTreeData,
    { dragSourceId, dropTargetId, dragSource, dropTarget }
  ) => {
    // log the source, sourceid, target, targetid
    console.log({ dragSourceId, dropTargetId, dragSource, dropTarget });
    const trueTarget = tagMap[dropTargetId];
    console.log("True target: ", trueTarget);
    const sourceTagIds = dndDataFindHereAndBelow(data, dragSourceId);
    // const targetTagIds = dndDataFindHereAndBelow(data, dropTargetId);
    // const targetTagId = dndDataFindHere(data, dropTargetId);

    const sourceTags = sourceTagIds.map((id) => tagMap[id]);
    // let targetTag = tagMap[targetTagId];
    let targetTag = dndConstructFullPath(data, dropTargetId);
    let sourceTagText = dragSource.text;
    console.log("Source tag text: ", sourceTagText);
    // if (targetTag === undefined) {
    //     // console.log("Making it up");
    //     // targetTag = dndConstructFullPath(data, dropTargetId);
    //     let children = targetTagIds
    //     children = children.map(id => tagMap[id]);
    //     children.sort((a, b) => a.split('.').length - b.split('.').length);
    //     targetTag = children.at(0).split('.').slice(0, -1).join('.');
    //     // return
    // }
    console.log("Source tags: ", sourceTags);
    console.log("Target tags: ", targetTag);
    const convert = (tag) => {
      // split on the source tag text, and keep the last part
      const parts = tag.split(sourceTagText);
      const lastPart = parts.at(-1);
      return `${targetTag}.${sourceTagText}${lastPart}`;
    };
    const newTagPaths = sourceTags.map((tag) => convert(tag));
    function zip(arrays) {
      return arrays[0].map((_, i) => arrays.map((array) => array[i]));
    }
    const newTags = zip([sourceTagIds.map(Number), newTagPaths]);
    console.log("New tags: ", newTags);
    updateTagPaths(newTags);

    // let { tagId: source } = dragSource;
    // let { tagId: target } = dropTarget;
    // console.log(`Moving ${source} to ${target}`);
    // source = tagMap[source];
    // target = tagMap[target];
    // console.log("Moving", source, "to", target);
  };
  return (
    <Box sx={{ alignSelf: "start" }}>
      <DndProvider backend={MultiBackend} options={getBackendOptions()}>
        <Tree
          listComponent={Stack}
          listItemComponent={Stack}
          tree={data}
          rootId={-1}
          onDrop={handleDrop}
          render={(node, { depth, isOpen, onToggle, hasChild }) => {
            // console.log("Node: ", node)
            return (
              //     {isOpen ? <ExpandMoreIcon /> : <ChevronRightIcon />}
              // <ListItemText primary={node.text} secondary={null} sx={{ marginLeft: depth * 10 }} onClick={onToggle}>
              // align middle vertically
              <Stack
                direction="row"
                sx={{ alignItems: "center", my: 0.5, ml: depth * 3 }}
                spacing={1}
              >
                <IconButton
                  size="small"
                  sx={{ mr: 0.5 }}
                  disableRipple={!hasChild}
                  onClick={onToggle}
                >
                  {isOpen ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                </IconButton>
                <TagChip
                  tag={node.text}
                  kind={node.tagId ? "file" : "directory"}
                />
              </Stack>
            );
          }}
        />
      </DndProvider>
    </Box>
  );
}

function TagTree({ data }) {
  const renderTree = (nodes) => (
    <>
      {Object.entries(nodes).map(([k, subtree]) => {
        const [_id, tag] = getIdAndTag(k);
        return (
          <TreeItem key={k} nodeId={k} label={tag}>
            {subtree.length !== 0 ? renderTree(subtree) : null}
          </TreeItem>
        );
      })}
    </>
  );

  return (
    <Box
      sx={{ minHeight: 110, flexGrow: 1, maxWidth: 300, alignSelf: "start" }}
    >
      <TreeView
        aria-label="tag tree view"
        defaultCollapseIcon={<ExpandMoreIcon />}
        // defaultExpanded={['root']}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {renderTree(data)}
      </TreeView>
    </Box>
  );
}
const getIdAndTag = (key) => /\$#(\d+)-(.*)/.exec(key)?.slice(1) ?? [-1, key];

function nest(tags) {
  const separator = ".";
  const parts = (tagStr) => tagStr.split(separator);
  const topLevelTag = (tagStr) => parts(tagStr).at(0);
  const criteria = ({ tagStr }) => topLevelTag(tagStr);
  const group = (tagObjArr) => Object.groupBy(tagObjArr, criteria);
  const isNotNested = (tagStr) => !tagStr.includes(separator);
  const helper = (tagObjArr) => {
    tagObjArr = tagObjArr.filter(({ tagStr: s }) => s !== "");
    if (tagObjArr.length === 0) return [];
    let nonNested = tagObjArr.filter(({ tagStr }) => isNotNested(tagStr));
    nonNested = nonNested.map(({ tagId: id, tagStr: s }) => [
      s,
      `\$#${id}-${s}`,
    ]);
    nonNested = Object.fromEntries(nonNested);
    let groupedObj = group(tagObjArr);
    // replace the keys with the nested keys
    groupedObj = Object.fromEntries(
      Object.entries(groupedObj).map(([k, v]) => [nonNested[k] || k, v])
    );

    const entries = Object.entries(groupedObj);
    for (const [k, v] of entries) {
      const grouped = helper(
        v.map((o) => ({
          ...o,
          tagStr: parts(o.tagStr).slice(1).join(separator),
        }))
      );
      groupedObj[k] = grouped;
    }
    return groupedObj;
  };
  return helper(tags);
}

function nestForReactDndTreeview(tags) {
  const separator = ".";
  const parts = (tagStr) => tagStr.split(separator);
  const topLevelTag = (tagStr) => parts(tagStr).at(0);
  const bottomLevelTag = (tagStr) => parts(tagStr).at(-1);
  const criteria = ({ tagStr }) => topLevelTag(tagStr);
  const group = (tagObjArr) => Object.groupBy(tagObjArr, criteria);
  const isNotNested = (tagStr) => !tagStr.includes(separator);
  const fullTag = (tagParts, i) => tagParts.slice(0, i + 1).join(separator);
  let nextId = 1;
  const lookup = new Map();
  const added = new Set();
  const helper = (tagObjArr) => {
    const result = [];
    const entries = Object.entries(group(tagObjArr));
    for (const [k, v] of entries) {
      v.sort(
        (a, b) =>
          b.tagStr.split(separator).length - a.tagStr.split(separator).length
      );
      for (const { tagId, tagStr } of v) {
        const tagParts = parts(tagStr);
        const stagedResult = [];
        for (let i = tagParts.length - 1; i >= 0; i--) {
          const id = lookup.get(fullTag(tagParts, i)) || nextId++;
          lookup.set(fullTag(tagParts, i), id);
          const iL = i - 1;
          if (iL >= 0) {
            // get all the elements from 0 upto and including iL
            const fullParent = fullTag(tagParts, iL);
            const parentId = lookup.get(fullParent) || nextId++;
            // const [parentId, parentFullTag] = lookup.get(fullParent) || [nextId++, fullParent];
            lookup.set(fullParent, parentId);
            // lookup.set(fullParent, [parentId, parentFullTag]);
            if (!added.has(id)) {
              stagedResult.push({
                id,
                parent: parentId,
                // parentTag: fullParent,
                tag: fullTag(tagParts, i),
                droppable: true,
                text: tagParts[i],
                tagId,
              });
              added.add(id);
            }
          } else if (!added.has(id)) {
            stagedResult.push({
              id,
              parent: -1,
              droppable: true,
              text: tagParts[i],
              tag: fullTag(tagParts, i),
              tagId,
            });
            added.add(id);
          }
        }
        // find any staged result that has a tag matching the current tag and add the tagId
        const indexOfResult = stagedResult.findIndex(
          ({ tag }) => tag === tagStr
        );
        if (indexOfResult !== -1) {
          stagedResult[indexOfResult].tagId = tagId;
          // // delete tag property from the result
          // delete stagedResult[indexOfResult].tag;
        }
        result.push(...stagedResult);
      }
    }
    return result;
  };
  return helper(tags);
}

function dndDataFindChildren(data, id) {
  const helper = (data, parentId) => {
    const children = data
      .filter(({ parent: p }) => p === parentId)
      .map(({ tagId, id }) => ({ tagId, id }));
    if (children.length === 0) return [];
    return children
      .reduce((acc, { id, tagId }) => [...acc, tagId, ...helper(data, id)], [])
      .filter((x) => x !== undefined);
  };
  return helper(data, id);
}

function dndDataFindHereAndBelow(data, id) {
  const childTagIds = dndDataFindChildren(data, id);
  const tagId = dndDataFindHere(data, id);
  return [tagId, ...childTagIds].filter((x) => x !== undefined);
}

function dndDataFindHere(data, id) {
  return data.find(({ id: i }) => i === id)?.tagId;
}

function dndConstructFullPath(data, id) {
  const separator = ".";
  const getNode = (id) => data.find(({ id: i }) => i === id);
  let curr = getNode(id);
  let result = curr.text;
  console.log("starts as ", result);
  while (curr.parent !== -1) {
    curr = getNode(curr.parent);
    result = `${curr.text}${separator}${result}`;
    console.log("become as ", result);
  }
  return result;
}
