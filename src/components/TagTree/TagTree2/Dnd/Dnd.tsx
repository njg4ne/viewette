import { DndContext, DragOverlay } from "@dnd-kit/core";
import { useState } from "react";
import TagFamilyPreview from "../../TagFamilyPreview";
import { getAllItemIds } from "../TagTree2";
import * as popups from "../../../../popups";
import { persistMerge, persistNest } from "../../TagTreeItems/MergeMenuItem";
import { dbs, signalReady } from "../../../../signals";
import { useSnackbar } from "notistack";
import { useModalContext } from "../../../../contexts/ModalContext";
import { useLoadingContext } from "../../../../contexts/LoadingContext";
import { Stack, Typography } from "@mui/material";
import { TagChip } from "../../../TagChip";
import TagTreeItem from "../TagTreeItem";
export default function Dnd({ children }: { children: React.ReactNode }) {
  const [itemBeingDragged, setItemBeingDragged] =
    useState<Viewette.TagTree.Item | null>(null);
  const itemFamily = itemBeingDragged ? getAllItemIds([itemBeingDragged]) : [];
  const { enqueueSnackbar: sbqr } = useSnackbar();
  const { setModalActions } = useModalContext();
  const { loading, setLoading } = useLoadingContext();
  function queueCombine(srcItem: any, destPath: string) {
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
    const srcItem = event.active?.data?.current?.tag;
    const destItem = event.over?.data?.current?.tag;
    // const srcPath = srcItem?.path;
    const destPath = destItem?.path;
    const destHl = event.over?.data?.current?.highlight;
    const srcTag = srcItem?.tag;
    if (srcItem && destPath && srcItem.path) {
      queueCombine(srcItem, destPath);
    } else if (srcItem && destHl) {
      if (srcTag) {
        queueAddTagToHighlight(srcTag, destHl);
      } else {
        popups.error(sbqr, "Cannot add category to a highlight");
      }
    }
  }
  function handleDragStart(event: Event & any) {
    setItemBeingDragged(event.active?.data?.current?.tag);
    // setItemBeingDragged(event.active?.data?.current || []);
  }
  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      {children}
      <DragOverlay style={{ opacity: 1 }}>
        {itemBeingDragged?.path && itemFamily && (
          <TagFamilyPreview
            label={itemBeingDragged.path}
            size={itemFamily.length}
          />
        )}
      </DragOverlay>
    </DndContext>
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
