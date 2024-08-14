import { IconButton, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { TagChip } from "../TagChip";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "preact/hooks";
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
import { getAllItemPaths, maxLevels } from "../../utils/tagTreeUtils";
import { getTagParts, SEPARATOR } from "../TagTree/utils";
import type {
  TableCellProps as MuiTableCellProps,
  TableCellBaseProps as MuiTableCellBaseProps,
} from "@mui/material/TableCell";
type TableCellProps = MuiTableCellProps & MuiTableCellBaseProps;
import { useTheme } from "@mui/material/styles";
import DownloadIcon from "@mui/icons-material/Download";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
// import TableRowsIcon from "@mui/icons-material/TableRowsOutlined";
import HtmlIcon from "@mui/icons-material/Html";
// import { utils as spreadsheetUtils, writeFileXLSX } from "xlsx";
import { utils as spreadsheetUtils, writeFile } from "xlsx-js-style";
import { ManagedTagChooser } from "../TagsFilter";
import { entrify } from "../EditHighlight/EditHighlight";
import Tooltip from "@mui/material/Tooltip";
import ContrastQueryBuilder from "./ContrastQueryBuilder";
import { useModel } from "../../hooks";
import { TaguetteDb } from "../../db";
import { useLoadingContext } from "../../contexts/LoadingContext";
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
  const tableRef = useRef<HTMLTableElement>(null);
  // function testTableExport(e: Event) {
  //   if (tableRef.current) {
  //     const te = new TableExport(tableRef.current, {
  //       formats: ["xlsx"],
  //     });
  //     let data: any = te.getExportData();
  //     data = data[Object.keys(data)[0]]["xlsx"];
  //     te.export2file(
  //       data.data,
  //       data.mimeType,
  //       "Tagging-Summary",
  //       data.fileExtension
  //     );
  //   }
  // }
  const { taggings: allTaggings, allTagsUnfiltered: tags } = useTreeContext();
  const initialTagEntry = [-1, ""] as [number, string];
  const contrastOptions = useMemo(
    () => [initialTagEntry].concat(entrify(tags)),
    [tags]
  );

  // const tags = taggings.map(({ parentPath: x }) => x);
  // console.log("Tags", tags);
  const mostLevels = maxLevels(tags);
  // console.log("Most levels", mostLevels);
  const [levels, setLevels] = useState<number>(mostLevels);
  const [colorOn, setColorOn] = useState<boolean>(true);
  const [doContrast, setDoContrast] = useState<boolean>(true);
  const [showLeaves, setShowLeaves] = useState<boolean>(true);
  const [contrastEntry, setContrastEntry] =
    useState<[number, string]>(initialTagEntry);

  const onAutocompleteChange = (event: Event, newValue: [number, string]) => {
    if (newValue === null) {
      newValue = initialTagEntry;
    }
    const [id, path] = newValue;
    setContrastEntry(newValue);
  };
  // console.log("Contrast Entry", contrastEntry);
  const whereSql =
    contrastEntry[0] === -1 ? "(1 = 1)" : `(path like '${contrastEntry[1]}%')`;
  const { loading } = useLoadingContext();
  useEffect(() => {
    const [id, path] = contrastEntry;
    const newContrastEntry =
      contrastOptions.find(([newId, newPath]) => newId === id) ||
      contrastOptions.find(([newId, newPath]) => newPath === path) ||
      initialTagEntry;
    // console.log("New Contrast Entry", newContrastEntry);
    setContrastEntry(newContrastEntry as [number, string]);
  }, [contrastOptions]);

  const model = (db: TaguetteDb) => () => {
    // console.log("requery");
    return db.read.taggingsByPath(getAllItemPaths(tags), whereSql) as any;
  };
  const validContrast = doContrast && contrastEntry[0] !== -1;

  const [contrastTrueTaggings, contrastFalseTaggings] = useModel<
    [Taguette.TaggingSummary[], Taguette.TaggingSummary[]]
  >([[], []], model, [tags, whereSql, loading]);

  // useEffect(() => {
  //   console.log(...contrastTrueTaggings.slice(0));
  //   console.log(...contrastFalseTaggings.slice(0));
  // }, [contrastTrueTaggings, contrastFalseTaggings]);

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
          // disabled
          flexGrow={2}
          checked={doContrast}
          setChecked={setDoContrast}
          ariaLabel="contrast tag off or on"
        />
        <IconButton
          variant="contained"
          sx={{
            borderRadius: ".25rem",
            backgroundColor: "secondary.main",
            color: "secondary.contrastText",
            px: ".5rem",
            py: 0,
            alignSelf: "center",
            flexGrow: 0,
            display: "flex",
            justifyContent: "space-around",
          }}
          onClick={() => copyTableContentsToClipboard(tableRef.current!)}
        >
          <ContentCopyIcon />
          <HtmlIcon fontSize="large" sx={{ mx: 0.5 }} />
        </IconButton>
        {/* <Tooltip
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
            // onClick={testTableExport}
          >
            <DownloadIcon />
          </IconButton>
        </Tooltip> */}
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
      {false ? (
        <Table
          sx={{ minWidth: 650, borderCollapse: "collapse" }}
          aria-label="simple table"
          ref={tableRef}
        >
          <TableHead>
            <TableRow>
              {["A", "B", "C"].map((header, i, arr) => (
                <TableCell sx={{ ...cellSx, whiteSpace: "nowrap" }} rowSpan={2}>
                  {header}
                </TableCell>
              ))}
              {["D", "E", "F"].map((header, i, arr) => (
                <TableCell sx={{ ...cellSx, whiteSpace: "nowrap" }} colSpan={2}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              {["G", "H", "G", "H", "G", "H"].map((header, i, arr) => (
                <TableCell sx={{ ...cellSx, whiteSpace: "nowrap" }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody></TableBody>
        </Table>
      ) : (
        <Table
          sx={{ minWidth: 650, borderCollapse: "collapse" }}
          aria-label="simple table"
          ref={tableRef}
        >
          <TableHead>
            <TableRow>
              {getHeaderData(levels).map((header) => (
                <HeaderCell
                  data={header}
                  sx={cellSx}
                  rowSpan={validContrast ? 2 : 1}
                />
              ))}
              {[
                ...(validContrast
                  ? [`With`, "Without", "Total"]
                  : ["# Highlights", "# Documents"]),
              ].map((header) => (
                <HeaderCell
                  data={header}
                  sx={cellSx}
                  colSpan={validContrast ? 2 : 1}
                />
              ))}
            </TableRow>
            {validContrast && (
              <TableRow>
                {Array.from({ length: 3 }, (_, i) =>
                  ["Hlts", "Docs"].map((header) => (
                    <HeaderCell data={header} sx={cellSx} />
                  ))
                ).flat()}
              </TableRow>
            )}
          </TableHead>
          <TableBody>
            {taggings.map((row, index) => (
              <TableRow
                key={row.parentPath}
                // sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TagCells
                  // rowSpan={2}
                  data={getTagRowData(row.parentPath, levels)}
                  sx={cellSx}
                  color={colorOn}
                />
                {validContrast ? (
                  <ContrastCells
                    row={row}
                    contrastTag={contrastEntry[1]}
                    contrastTrueTaggings={contrastTrueTaggings}
                    contrastFalseTaggings={contrastFalseTaggings}
                    sx={cellSx}
                  />
                ) : (
                  <>
                    <TableCell sx={cellSx}>{row.hlCount}</TableCell>
                    <TableCell sx={cellSx}>{row.docCount}</TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
}

function HeaderCell(props: TableCellProps & { data: string }) {
  let { data, sx, ...rest } = props;
  sx = { ...sx, whiteSpace: "nowrap" };
  props = { data, sx, ...rest };
  return <TableCell {...props}>{data}</TableCell>;
}

function ContrastCells({
  sx,
  row,
  contrastTag,
  contrastTrueTaggings,
  contrastFalseTaggings,
}: {
  row: Taguette.TaggingSummary;
  contrastTag: string;
  contrastTrueTaggings: Taguette.TaggingSummary[];
  contrastFalseTaggings: Taguette.TaggingSummary[];
} & TableCellProps) {
  const trueTagging = contrastTrueTaggings.find(
    (tagging: Taguette.TaggingSummary) => tagging.parentPath === row.parentPath
  ) as Taguette.TaggingSummary;
  const falseTagging = contrastFalseTaggings.find(
    (tagging: Taguette.TaggingSummary) => tagging.parentPath === row.parentPath
  ) as Taguette.TaggingSummary;
  return (
    trueTagging &&
    falseTagging && (
      <>
        {/* order is with, hl doc, without hl doc, total hl doc */}
        <TableCell sx={sx}>{trueTagging.hlCount}</TableCell>
        <TableCell sx={sx}>{trueTagging.docCount}</TableCell>
        <TableCell sx={sx}>{falseTagging.hlCount}</TableCell>
        <TableCell sx={sx}>{falseTagging.docCount}</TableCell>
        <TableCell sx={sx}>{row.hlCount}</TableCell>
        <TableCell sx={sx}>{row.docCount}</TableCell>
      </>
    )
  );
}

function ContrastSubTable({
  contrastTag,
  withData,
  withoutData,
  ...rest
}: {
  contrastTag: string;
  withData: number;
  withoutData: number;
} & TableCellProps) {
  contrastTag = getTagParts(contrastTag).at(-1) || contrastTag;
  const headers = [`with ${contrastTag}`, `without`];
  const cellSx = {
    px: 1,
    py: 0.25,
    textAlign: "center",
  };
  const borderSx = {
    border: ".5px solid",
  };
  return (
    <TableCell sx={{ ...cellSx, ...borderSx, p: 0, whiteSpace: "nowrap" }}>
      <Table sx={{ borderCollapse: "collapse" }}>
        <TableHead>
          <TableRow>
            {headers.map((header) => (
              <TableCell {...rest} sx={cellSx}>
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell {...rest} sx={cellSx}>
              {withData}
            </TableCell>
            <TableCell {...rest} sx={cellSx}>
              {withoutData}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableCell>
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
  // test: merge the row 2 and 3 in column 1
  // const merge = { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } };
  // ws["!merges"] = [merge];
  // for real: go through all rows and columns; for all contiguous cells with the same value, merge them
  // const { s: start, e: end } = spreadsheetUtils.decode_range(
  //   ws["!ref"] as string
  // );
  // for (let colNum = start.c; colNum <= end.c; colNum++) {
  //   let cellValue;
  //   for (let rowNum = 1; rowNum <= end.r; rowNum++) {
  //     const cell = ws[spreadsheetUtils.encode_cell({ r: rowNum, c: colNum })];
  //     if (!cell) continue;
  //     if (Number.isNaN(Number.parseInt(cell.v))) {
  //       cellValue = cell.v;
  //     }
  //   }
  // }
  // var rows = [];
  // var row;
  // var rowNum;
  // var colNum;
  // for (rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
  //   row = [];
  //   for (colNum = range.s.c; colNum <= range.e.c; colNum++) {
  //     const cell = ws[spreadsheetUtils.encode_cell({ r: rowNum, c: colNum })];
  //     row.push(cell);
  //   }
  //   rows.push(row);
  // }
  // console.log("Rows", rows);

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

// async function copyTableContentsToClipboard(table: HTMLTableElement) {
// want all of the html with styles for pasting to excel
// const html = table.outerHTML;
// await navigator.clipboard.writeText(html);
// }
// https://stackoverflow.com/questions/26053004/copy-whole-html-table-to-clipboard-javascript
function copyTableContentsToClipboard(el: HTMLElement) {
  var body = document.body,
    range,
    sel;
  if (document.createRange && window.getSelection) {
    range = document.createRange();
    sel = window.getSelection() as Selection;
    sel.removeAllRanges();
    try {
      range.selectNodeContents(el);
      sel.addRange(range);
    } catch (e) {
      range.selectNode(el);
      sel.addRange(range);
    }

    
    document.execCommand("Copy");
  }
}
