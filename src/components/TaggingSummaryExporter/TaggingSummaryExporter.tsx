import { IconButton, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { TagChip } from "../TagChip";
import { useEffect, useRef, useState } from "preact/hooks";
import Grid from "@mui/material/Grid";
import Slider from "@mui/material/Slider";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { documentToSVG, elementToSVG, inlineResources } from "dom-to-svg";
import { TreeProvider, useTreeContext } from "../../contexts/TagTreeContext";
import { SearchParamProvider } from "../../contexts/SearchParamContext";
import AutoSizer from "react-virtualized-auto-sizer";
import { useBranchedTags } from "../TagTree/TagTree2/TagTree2";
// import { useTheme } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { maxLevels } from "../../utils/tagTreeUtils";
import { getTagParts, SEPARATOR } from "../TagTree/utils";
import type { TableCellProps } from "@mui/material/TableCell";
import { useTheme } from "@mui/material/styles";
import DownloadIcon from "@mui/icons-material/Download";
// import { utils as spreadsheetUtils, writeFileXLSX } from "xlsx";
import { utils as spreadsheetUtils, writeFile } from "xlsx-js-style";
import { ManagedTagChooser } from "../TagsFilter";
import { entrify } from "../EditHighlight/EditHighlight";
import Tooltip from "@mui/material/Tooltip";
import ContrastQueryBuilder from "./ContrastQueryBuilder";
const headers: Record<string, string> = {
  parentPath: "Tag-Path",
  hlCount: "# Highlights",
  docCount: "# Documents",
};

export default () => (
  <SearchParamProvider keys={["tagLike", "newTag", "tagQuery"]}>
    <TreeProvider>
      <TaggingSummaryExporter />
    </TreeProvider>
  </SearchParamProvider>
);
function labelWrapSx(breakpoints: any) {
  return {
    textAlign: "center",
    whiteSpace: "nowrap",
    [breakpoints.down("sm")]: {
      whiteSpace: "normal",
    },
  };
}

function TaggingSummaryExporter() {
  const { taggings: allTaggings, allTagsUnfiltered: tags } = useTreeContext();
  // const tags = taggings.map(({ parentPath: x }) => x);
  // console.log("Tags", tags);
  const mostLevels = maxLevels(tags);
  // console.log("Most levels", mostLevels);
  const [levels, setLevels] = useState<number>(mostLevels);
  const [colorOn, setColorOn] = useState<boolean>(true);
  const [doContrast, setDoContrast] = useState<boolean>(false);
  const [showLeaves, setShowLeaves] = useState<boolean>(true);
  const initialTagEntry = [-1, ""] as [number, string];
  const [contrastEntry, setContrastEntry] =
    useState<[number, string]>(initialTagEntry);
  const contrastOptions = [[-1, ""]].concat(entrify(tags));
  const onAutocompleteChange = (event: Event, newValue: [number, string]) => {
    if (newValue === null) {
      newValue = initialTagEntry;
    }
    const [id, path] = newValue;
    setContrastEntry(newValue);
  };
  useEffect(() => {
    setLevels(mostLevels);
  }, [mostLevels]);
  const { breakpoints } = useTheme();
  const taggings = showLeaves
    ? allTaggings
    : allTaggings.filter(
        ({ parentPath }) => getTagParts(parentPath).length <= levels
      );
  // alert(`Most levels: ${mostLevels}`);

  // for the levels, we want to go Root Tag, Subtag L1, Subtag L2, etc.
  const cellSx = {
    border: "1px solid",
    px: 1,
    py: 0.25,
    // center text
    textAlign: "center",
  };
  const wkbk = toXLSX(taggings, levels);

  return (
    <Paper
      elevation={1}
      component={Stack}
      sx={{ p: 2, height: "100%", overflow: "auto" }}
      spacing={2}
      direction="column"
      alignItems="flex-start"
    >
      <Stack
        direction="row"
        flexWrap="wrap"
        // backgroundColor="secondary.main"
        justifyContent="space-around"
        width="100%"
      >
        <FormControlLabel
          sx={{ flexGrow: 6, display: "flex", mr: 2 }}
          labelPlacement="start"
          label={`${levels - 1} Splits`}
          slotProps={{
            typography: {
              mr: 2,
              sx: { whiteSpace: "nowrap" },
            },
          }}
          control={
            <Slider
              sx={{ minWidth: "5rem" }}
              value={levels}
              onChange={(_: unknown, v: number) => setLevels(v)}
              min={1}
              max={mostLevels}
              step={1}
              marks
            />
          }
        />

        {/* <FormControlLabel
          sx={{ flexGrow: 2, display: "flex", justifyContent: "center", m: 0 }}
          labelPlacement="start"
          label={`Color`}
          slotProps={{ typography: { whiteSpace: "nowrap" } }}
          control={
            <Switch
              checked={colorOn}
              onChange={(_: unknown, v: boolean) => setColorOn(v)}
              inputProps={{ "aria-label": "table colors off or on" }}
            />
          }
        /> */}
        <ToggleControl
          label="Color"
          flexGrow={2}
          checked={colorOn}
          setChecked={setColorOn}
          ariaLabel="table colors off or on"
        />
        <ToggleControl
          label="Include Leaves"
          flexGrow={2}
          checked={showLeaves}
          setChecked={setShowLeaves}
          ariaLabel="exclude or include leaves at lowest level"
        />
        <ToggleControl
          label="Tag Contrast"
          disabled
          flexGrow={2}
          checked={doContrast}
          setChecked={setDoContrast}
          ariaLabel="contrast tag off or on"
        />
        <Tooltip
          title="Download as XLSX"
          aria-label="download as xlsx"
          placement="top"
        >
          <IconButton
            variant="contained"
            sx={{
              borderRadius: ".25rem",
              backgroundColor: "secondary.main",
              color: "secondary.contrastText",
              padding: ".125rem",
              alignSelf: "center",
              flexGrow: 1,
            }}
            onClick={() => downloadAs("xlsx", taggings, levels, colorOn)}
          >
            <DownloadIcon />
          </IconButton>
        </Tooltip>
        {/* <ContrastQueryBuilder
          onSqlChange={(sql: string) => {
            console.log(sql);
          }}
        /> */}
        {doContrast && (
          <ManagedTagChooser
            multiple={false}
            options={contrastOptions}
            sx={{ width: "100%", my: 1 }}
            defaultValue={[]}
            onChange={onAutocompleteChange}
            value={contrastEntry}
            disabled={false}
          />
        )}
      </Stack>
      <Table
        sx={{ minWidth: 650, borderCollapse: "collapse" }}
        aria-label="simple table"
      >
        <TableHead>
          <TableRow>
            {[...getHeaderData(levels), "# Highlights", "# Documents"].map(
              (header) => (
                <TableCell sx={{ ...cellSx, whiteSpace: "nowrap" }}>
                  {header}
                </TableCell>
              )
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {taggings.map((row) => (
            <TableRow
              key={row.parentPath}
              // sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TagCells
                data={getTagRowData(row.parentPath, levels)}
                sx={cellSx}
                color={colorOn}
              />
              <TableCell sx={cellSx}>{row.hlCount}</TableCell>
              <TableCell sx={cellSx}>{row.docCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

const mimeTypes = {
  csv: "text/csv",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

function downloadAs(
  extension: keyof typeof mimeTypes,
  taggings: Taguette.TaggingSummary[],
  levels: number,
  colorOn: boolean = true
) {
  if (extension === "xlsx") {
    const wkbk = toXLSX(taggings, levels, colorOn);
    writeFile(wkbk, "Tagging-Summary.xlsx");
  }
}

function toXLSX(
  objArray: Taguette.TaggingSummary[],
  levels: number,
  colorOn = true
) {
  const headers: string[] = [
    ...getHeaderData(levels),
    "# Highlights",
    "# Documents",
  ];
  const datas: string[][] = objArray.map(
    (row) =>
      [
        ...getTagRowData(row.parentPath, levels),
        row.hlCount,
        row.docCount,
      ] as string[]
  );
  // now collect into an arr of objects with headers as keys
  function reducer(acc: Record<string, string>, data: string, index: number) {
    const key: string = headers[index];
    const val: string = data;
    acc[key] = val;
    return acc;
  }
  type Cell = { v: string; t: string; s: Record<string, any> };
  function getBorders(style: "thin" | "medium" | "thick" = "thin") {
    const sides = ["top", "left", "bottom", "right"];
    return sides.reduce((acc, side) => {
      const color = { rgb: "000000" };
      acc[side] = { style, color };
      return acc;
    }, {} as Record<string, any>);
  }
  function getColorStyle(data: string) {
    if (!(data || "").length || !colorOn) return {};
    const bgColor = stringToColor(data);
    const textColor = colorIsLight(bgColor) ? "#000000" : "#ffffff";
    return {
      fill: { fgColor: { rgb: bgColor.slice(1) } },
      font: { color: { rgb: textColor.slice(1) } },
    };
  }

  function aoaReducer(acc: Cell[], data: string, index: number) {
    const sides = ["top", "left", "bottom", "right"];
    const border = getBorders("thin");
    const s = { ...getColorStyle(data), border };
    acc.push({ v: data, t: "s", s } as Cell);
    return acc;
  }
  // const rows = datas.map((data: string[]) => data.reduce(reducer, {}));
  // const ws = spreadsheetUtils.json_to_sheet(rows, { header: headers });
  const aoa = datas.map((data: string[]) => data.reduce(aoaReducer, []));
  const headerStyled = headers.map((header) => ({
    v: header,
    t: "s",
    s: { font: { bold: true }, border: getBorders("thin") },
  }));
  aoa.unshift(headerStyled);
  const ws = spreadsheetUtils.aoa_to_sheet(aoa);
  applyAutoWidth(ws, 1.1);
  // back to json for debugging
  // const json = spreadsheetUtils.sheet_to_json(ws, { header: headers });
  // console.log(...json);
  const workbook = spreadsheetUtils.book_new();
  spreadsheetUtils.book_append_sheet(workbook, ws, "Taggings-Summary");
  return workbook;
}
type ToggleControlProps = {
  label: string;
  flexGrow: number;
  checked: boolean;
  setChecked: (v: boolean) => void;
  ariaLabel: string;
  disabled?: boolean;
};
function ToggleControl({
  label,
  flexGrow,
  checked,
  setChecked,
  ariaLabel,
  disabled,
}: ToggleControlProps) {
  // const { breakpoints } = useTheme();
  // const wrapSx = labelWrapSx(breakpoints);
  return (
    <FormControlLabel
      sx={{ flexGrow, display: "flex", justifyContent: "center", m: 0 }}
      labelPlacement="start"
      label={label}
      // slotProps={{ typography: { sx: wrapSx } }}
      control={
        <Switch
          disabled={disabled}
          checked={checked}
          onChange={(_: unknown, v: boolean) => setChecked(v)}
          inputProps={{ "aria-label": ariaLabel }}
        />
      }
    />
  );
}

function TagCells({
  data,
  color = true,
  ...rest
}: TableCellProps & { data: string[]; color?: boolean }) {
  const borderColor = useTheme().palette.text.primary;
  function getColorSx(data: string) {
    if (!color || !data) return {};
    const firstPart = getTagParts(data)[0];
    const bg = stringToColor(firstPart);
    const fg = colorIsLight(bg) ? "black" : "white";
    return { backgroundColor: bg, color: fg, borderColor };
  }
  return (
    <>
      {data.map((cell) => (
        <TableCell
          {...rest}
          sx={{
            ...rest.sx,
            ...getColorSx(cell),
          }}
        >
          {cell}
        </TableCell>
      ))}
    </>
  );
}

function getHeaderData(levels: number) {
  // console.log("Levels for header", levels);
  const headers: string[] = ["Root-Tag"];
  for (let i = 1; i < levels; i++) {
    headers.push(`Sub-${i}-Tag`);
  }
  // console.log("Headers", headers);
  return headers;
}

function getTagRowData(path: string, levels: number) {
  const parts = getTagParts(path);
  const data: string[] = Array.from(
    { length: levels - 1 },
    (_, i) => parts[i] || ""
  );
  data.push(parts.slice(levels - 1).join(SEPARATOR));
  return data;
}

// Source https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
const stringToColor = (str: string) => {
  let hash = 0;
  str.split("").forEach((char) => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  });
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += value.toString(16).padStart(2, "0");
  }
  return color;
};

function colorIsLight(color: string) {
  //<--color in the way '#RRGGBB
  if (color.length == 7) {
    const rgb = [
      parseInt(color.substring(1, 3), 16),
      parseInt(color.substring(3, 5), 16),
      parseInt(color.substring(5), 16),
    ];
    const luminance =
      (0.2126 * rgb[0]) / 255 +
      (0.7152 * rgb[1]) / 255 +
      (0.0722 * rgb[2]) / 255;
    return luminance > 0.5;
  }
  return false;
}

const removeDuplicatesInArray = (array: any[]) => {
  return array.filter((elem, pos) => array.indexOf(elem) === pos);
};

// source: https://gist.github.com/burdukowsky/c13414966fa44b76b55664181ee44b07
function applyAutoWidth(XLSXWorkSheet: any, widthMultiplier: number) {
  widthMultiplier = widthMultiplier || 1.25;

  const cellsKeys = Object.keys(XLSXWorkSheet).filter((key) =>
      key.match(/^[A-Z]+\d+$/)
    ),
    columns = removeDuplicatesInArray(
      cellsKeys.map((key) => key.replace(/\d/g, ""))
    );

  const getMaxLengthOfColumn = (column: any) => {
    const regExp = new RegExp("^" + column + "\\d+$"),
      keysOfColumn = cellsKeys.filter((key) => key.match(regExp));

    return keysOfColumn.reduce((max, key) => {
      const cellLength = (XLSXWorkSheet[key].v + "").length;
      return cellLength > max ? cellLength : max;
    }, 0);
  };

  if (XLSXWorkSheet["!cols"] == null) {
    XLSXWorkSheet["!cols"] = [];
  }

  columns.forEach((column: any, index: number) => {
    if (XLSXWorkSheet["!cols"][index] == null) {
      XLSXWorkSheet["!cols"][index] = {};
    }

    Object.assign(XLSXWorkSheet["!cols"][index], {
      width: getMaxLengthOfColumn(column) * widthMultiplier,
    });
  });
}
