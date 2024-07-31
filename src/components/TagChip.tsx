import { Ref } from "preact/compat";
import Typography from "@mui/material/Typography";
import { SEPARATOR, getTagParts } from "./TagTree/utils";
import type { SxProps } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export function TagChip({
  id,
  // ref,
  tag,
  specialColor = false,
  underline = false,
  sx,
  tight,
}: {
  id?: string;
  tag: string;
  specialColor?: boolean;
  sx?: SxProps;
  ref?: Ref<HTMLParagraphElement>;
  underline?: boolean;
  tight?: boolean;
}) {
  const underlineColor = (useTheme().palette as any).underline || "transparent";

  const typeSx = {
    textDecoration: underline ? "underline" : "none",
    textDecorationColor: underlineColor,
    overflowWrap: "break-word",
    whiteSpace: "normal",
    pt: tight ? 0.2 : 0.5,
    pb: tight ? 0.15 : 0.5,
    px: tight ? 0.75 : 1,
    borderRadius: 1,
  };
  // replace all SEPARATOR with SEPAR+ nowidthspace, keeping what is between
  // "".split(SEPARATOR);
  // tag = tag || "";
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
      // ref={ref}
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
