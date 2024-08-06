import { useTreeContext } from "./contexts/TagTreeContext";
import { utils } from "xlsx";
import ListAltIcon from "@mui/icons-material/ListAlt";
import DownloadIcon from "@mui/icons-material/Download";
import IconButton from "@mui/material/IconButton";
import type { IconButtonProps } from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
const headers: Record<string, string> = {
  parentPath: "Tag-Path",
  hlCount: "# Highlights",
  docCount: "# Documents",
};
export default function TaggingSummaryExportButton(props: IconButtonProps) {
  const { taggings } = useTreeContext();
  let { sx, ...rest } = props;
  sx = sx || {};
  sx = {
    ...sx,
    borderRadius: ".25rem",
    backgroundColor: "secondary.main",
    color: "secondary.contrastText",
    padding: ".125rem",
  };
  return (
    <Tooltip title="Download Tagging Summary CSV">
      <IconButton
        onClick={() => downloadCSV(taggings)}
        {...rest}
        sx={sx}
        //   color="secondary"
        variant="contained"
      >
        <DownloadIcon />
        <SummarizeOutlinedIcon />
      </IconButton>
    </Tooltip>
  );
}

function toCSV(objArray: Taguette.TaggingSummary[]) {
  const ws = utils.json_to_sheet(objArray, {
    header: ["parentPath", "hlCount", "docCount"],
  });
  ws.A1 = { v: "Tag-Path", t: "s" };
  ws.B1 = { v: "# Highlights", t: "n" };
  ws.C1 = { v: "# Documents", t: "n" };

  //   const json = utils.sheet_to_json(ws, { header: 1 });
  //   console.log(json);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, ws, "Taggings-Summary");
  const csv = utils.sheet_to_csv(ws);
  return csv;
}

function downloadCSV(taggings: Taguette.TaggingSummary[]) {
  const textContent = toCSV(taggings);
  const blob = new Blob([textContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "taggings.csv";
  link.click();
  URL.revokeObjectURL(url);
  link.remove();
}
