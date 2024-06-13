import { Ref } from "preact/compat";
import Typography from "@mui/material/Typography";
import { SEPARATOR, getTagParts } from "./TagTree/utils";
import type { SxProps } from "@mui/material";

export function TagChip({
  id,
  ref,
  tag,
  specialColor = false,
  sx,
}: {
  id?: string;
  tag: string;
  specialColor?: boolean;
  sx?: SxProps;
  ref?: Ref<HTMLParagraphElement>;
}) {
  const typeSx = {
    overflowWrap: "break-word",
    whiteSpace: "normal",
    py: 0.5,
    px: 1,
    borderRadius: 1,
  };
  // replace all SEPARATOR with SEPAR+ nowidthspace, keeping what is between
  const parts = getTagParts(tag);
  const wrapInParenIfContainsWhitespace = (str: string) => {
    return str.includes(" ") ? `(${str})` : str;
  };
  const tagSpecial = parts
    .map(wrapInParenIfContainsWhitespace)
    .join(SEPARATOR + "\u200B");
  // const tagSpecial = tag;
  return (
    <Typography
      ref={ref}
      id={id}
      sx={{
        bgcolor: `primary.${!specialColor ? "main" : "200"}`,
        color: "primary.contrastText",
        maxWidth: "100%",
        ...typeSx,
        ...sx,
      }}
    >
      {tagSpecial}
    </Typography>
  );
}
