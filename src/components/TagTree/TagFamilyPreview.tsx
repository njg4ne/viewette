import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { TagChip } from "../TagChip";
import { Typography } from "@mui/material";

export default function TagFamilyPreview({
  label,
  size,
}: {
  label: string;
  size: number;
}) {
  return (
    <Paper
      // variant="outlined"
      component={Stack}
      direction="row"
      alignItems="center"
      spacing={0.75}
      sx={{ py: 0.75, px: 1, width: "max-content" }}
    >
      <DragIndicatorIcon fontSize="small" />
      {size > 1 && <Typography>{size} x</Typography>}
      <TagChip tag={label} />
      {size > 1 && <Typography> tags</Typography>}
    </Paper>
  );
}
