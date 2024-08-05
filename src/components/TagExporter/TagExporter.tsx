import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { TagChip } from "../TagChip";
import { useRef, useState } from "preact/hooks";
import Grid from "@mui/material/Grid";
import Slider from "@mui/material/Slider";
import Switch from "@mui/material/Switch";
import FormControlLabel from '@mui/material/FormControlLabel';

// import { cons } from "fp-ts/lib/ReadonlyNonEmptyArray";
import { documentToSVG, elementToSVG, inlineResources } from "dom-to-svg";
import { TreeProvider, useTreeContext } from "../../contexts/TagTreeContext";
import { SearchParamProvider } from "../../contexts/SearchParamContext";
import AutoSizer from "react-virtualized-auto-sizer";
import { useBranchedTags } from "../TagTree/TagTree2/TagTree2";
import { useTheme } from "@mui/material/styles";
export default () => (
  <SearchParamProvider keys={["tagLike", "newTag", "tagQuery"]}>
    <TreeProvider>
      <TagExporter />
    </TreeProvider>
  </SearchParamProvider>
);
function compareTags(a: Taguette.Tag, b: Taguette.Tag) {
  const pathA = a.path.toUpperCase();
  const pathB = b.path.toUpperCase();
  return pathA.localeCompare(pathB);
}

function TagExporter() {
  const [numCols, setNumCols] = useState<number>(2);
  const branches = useBranchedTags();
  const { allTags: tagsUnsorted } = useTreeContext();
  const allTags = tagsUnsorted.sort(compareTags);
  const colXs = 12 / numCols;
  const viewBox: DOMRect = new DOMRect(0, 0, 1000, 1000);
  const exportRef = useRef<HTMLElement>(null);
  function filter(node: any) {
    return node.tagName !== "i";
  }
  function downloadSvg(svgString: string) {
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "viewette-tags.svg";
    link.click();
    URL.revokeObjectURL(url);
    link.remove();
  }
  async function exportSvg() {
    if (exportRef.current) {
      console.log(exportRef.current);
      const svgDocument = elementToSVG(exportRef.current);
      await inlineResources(svgDocument.documentElement);
      const svgString = new XMLSerializer().serializeToString(svgDocument);
      downloadSvg(svgString);
    }
  }
  function sliderValueText(value: number) {
    return `${value}°C`;
  }
  const rgba = (r: number, g: number, b: number, a: number) =>
    `rgba(${r},${g},${b},${a})`;
  const colorAlpha = (a: number) => rgba(3, 169, 244, a);
  const textPrimary = useTheme().palette.text.primary;
  function renderBranch({ label, children }: any) {
    return (
      <Stack direction="row" flexWrap={"wrap"} bgcolor={colorAlpha(0.175)} borderRadius={".25rem"} p={1} m={1} border={`2px solid ${textPrimary}`} justifyContent="center" alignContent="center" >
        <Box width="100%" display="flex" justifyContent="center">
          <Typography width="max-content" fontWeight={500} fontSize="1rem"> {label} </Typography>
        </Box>
        {children.map(renderBranch)}
      </Stack>
    );
  }

  const [nested, setNested] = useState(true);



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
        spacing={1}
        alignSelf="stretch"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
        p={2}
      >
        <Button
          variant="contained"
          color="secondary"
          onClick={exportSvg}
          sx={{ alignSelf: "center" }}
          aria-label="export tags as SVG"
        >
          export tags as SVG
        </Button>
        <FormControlLabel control={<Switch inputProps={{ "aria-label": "nested or flat switch" }} checked={nested} onChange={(e: any) => setNested(e.target.checked)} />} label={nested ? "Nested" : "Flat"} labelPlacement="start" />
        {!nested && <FormControlLabel control={<Slider
          sx={{ width: "10rem", alignSelf: "center", ml: 3, }}
          aria-label="Number of Columns"
          //   defaultValue={numCols}
          value={numCols}
          getAriaValueText={sliderValueText}
          valueLabelDisplay="auto"
          onChange={(e, value) => setNumCols(value as number)}
          shiftStep={1}
          step={1}
          marks
          min={1}
          max={12}
        />} label="Number of Columns" labelPlacement="start" />}

      </Stack>
      {nested ? <Stack direction="row" gap={2} ref={exportRef}
        maxWidth={"100%"} flexWrap={"wrap"} justifyContent="center" alignItems="center"
      >
        {branches.map((branch, i) => {
          // console.log(branch);
          return renderBranch(branch);
        })}

      </Stack> :
        <Box flexGrow={1} bgcolor="" p={2} alignSelf={"stretch"}>
          {/* @ts-expect-error */}
          <Grid
            pb={1}
            container
            spacing={1}
            ref={exportRef}
            overflow={"auto"}
          >
            {allTags.map((tag, i) => (
              <Grid
                item
                key={i}
                xs={colXs}
                container
                alignItems="flex-start"
              >
                <TagChip tag={tag.path} sx={{ width: "max-content" }} />
              </Grid>
            ))}
          </Grid>
        </Box>}
    </Paper>
  );
}


TagExporter;
