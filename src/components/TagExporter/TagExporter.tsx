import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import { TagChip } from "../TagChip";
import { useRef, useState } from "preact/hooks";
import Grid from "@mui/material/Grid";
import Slider from "@mui/material/Slider";

// import { cons } from "fp-ts/lib/ReadonlyNonEmptyArray";
import { documentToSVG, elementToSVG, inlineResources } from "dom-to-svg";
import { TreeProvider, useTreeContext } from "../../contexts/TagTreeContext";
import { SearchParamProvider } from "../../contexts/SearchParamContext";
import AutoSizer from "react-virtualized-auto-sizer";

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
        <Stack
          direction="row"
          spacing={1}
          alignSelf="flex-start"
          flexWrap="wrap"
          gap={1}
        >
          <Box display="flex" alignItems="center" alignSelf="stretch">
            <Typography>Number of Columns</Typography>
          </Box>
          <Box display="flex" alignItems="center" alignSelf="stretch">
            <Slider
              sx={{ width: "20rem", alignSelf: "center", my: 1 }}
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
            />
          </Box>
        </Stack>
      </Stack>
      <Box flexGrow={1} bgcolor="" p={2} alignSelf={"stretch"}>
        {/* <AutoSizer>
          {({ width, height }) => ( */}
        {/* @ts-expect-error */}
        <Grid
          pb={1}
          container
          spacing={1}
          ref={exportRef}
          //   sx={{ width, height }}
          overflow={"auto"}
        >
          {allTags.map((tag, i) => (
            <Grid
              item
              key={i}
              xs={colXs}
              container
              //   justifyContent="center"
              alignItems="flex-start"
            >
              <TagChip tag={tag.path} sx={{ width: "max-content" }} />
            </Grid>
          ))}
        </Grid>
        {/* )}
        </AutoSizer> */}
        {/* <TagChip
          tag="shepherding.drifting"
          id="tag-to-make-svg"
          ref={tagRef}
          //   sx={{ fontFamily: "serif" }}
        /> */}
        {/* <svg
          xmlns="http://www.w3.org/2000/svg"
          height="100%"
          viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
          //   style={{ backgroundColor: "white" }}
        >
          <g>
            <rect x="0" y="20" fill="white" stroke="black" stroke-width="2" />
            <text x="0" y="20" font-family="Arial" font-size="20" fill="black">
              Your Text Here
            </text>
          </g>
        </svg> */}
      </Box>
    </Paper>
  );
}

TagExporter;
