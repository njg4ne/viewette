import IconButton from "@mui/material/IconButton";
import { RefObject } from "preact";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export function getCopyText(
  snippetSpanRef: RefObject<HTMLSpanElement>,
  source: string
) {
  const range = document.createRange();
  window.getSelection()?.removeAllRanges();
  range.selectNode(snippetSpanRef.current as Node);
  window.getSelection()?.addRange(range);
  const selectionContents = window.getSelection()?.toString();
  return `${source}: "${selectionContents}"`;
}

export function CopyHighlightIconButton({
  snippetSpanRef,
  highlight,
  focus,
  fontSize,
}: {
  snippetSpanRef: RefObject<HTMLSpanElement>;
  highlight: Taguette.Highlight;
  focus?: typeof HTMLElement.prototype.focus;
  fontSize?: string | number;
}) {
  return (
    <IconButton
      aria-label="copy to clipboard"
      onClick={() => {
        const el = document.getElementById(`highlight-li-${highlight.id}`);
        focus && focus();
        navigator.clipboard.writeText(
          getCopyText(snippetSpanRef, highlight.source)
        );
      }}
      sx={{
        borderRadius: 1,
        ml: 0.5,
      }}
    >
      <ContentCopyIcon sx={{ fontSize: fontSize || "1.25rem" }} />
    </IconButton>
  );
}
