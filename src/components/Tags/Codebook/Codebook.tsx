import { useContext, useEffect, useRef, useState } from "preact/hooks";
import { SearchParamProvider } from "../../../contexts/SearchParamContext";
import { TreeProvider } from "../../../contexts/TagTreeContext";
import { useBranchedTags } from "../../TagTree/TagTree2/TagTree2";
// import ListSubheader from "@mui/material/ListSubheader";
// import List from "@mui/material/List";
// import ListItem from "@mui/material/ListItem";
// import ListItemText from "@mui/material/ListItemText";
import { TagChip } from "../../TagChip";

import type {
  TypographyOwnProps,
  TypographyProps,
} from "@mui/material/Typography";
import Typography from "@mui/material/Typography";
import Box, { BoxProps } from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import HtmlIcon from "@mui/icons-material/Html";

import { Link } from "react-router-dom";
import { copyElementContentsToClipboard } from "../../TaggingSummaryExporter/TaggingSummaryExporter";
import { createContext, RefObject } from "preact";
import { forwardRef } from "preact/compat";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";

export default () => (
  <SearchParamProvider keys={["tagLike", "newTag", "tagQuery"]}>
    <TreeProvider>
      <Codebook />
    </TreeProvider>
  </SearchParamProvider>
);

export const ListContext = createContext([] as any);

//   const context = useContext(ListContext);

function Codebook() {
  const listRef = useRef<HTMLUListElement>(null);
  const branches = useBranchedTags();

  return (
    <Paper
      elevation={1}
      component={Stack}
      sx={{ p: 2, height: "100%", overflow: "auto" }}
      spacing={2}
      direction="column"
      alignItems="flex-start"
    >
      <ListContext.Provider value={useState(true)}>
        {/* row stack withs pace betweeen */}
        <Stack direction="row" justifyContent="" spacing={2}>
          <CopyHtmlButton contentRef={listRef} />
          <MakeLinksSwitch />
        </Stack>

        <BranchUl branches={branches} ref={listRef} />
      </ListContext.Provider>
    </Paper>
  );

  return <div>Codebook</div>;
}

function MakeLinksSwitch() {
  const [makeLinks, setMakeLinks] = useContext(ListContext);
  return (
    <FormControlLabel
      sx={{ display: "flex", justifyContent: "center", m: 0 }}
      labelPlacement="start"
      label="Hyperlinks"
      control={
        <Switch
          checked={makeLinks}
          onChange={(_: unknown, v: boolean) => {
            setMakeLinks(v);
          }}
          inputProps={{ "aria-label": "hyperlinks off or on" }}
        />
      }
    />
  );
}

const BranchUl = forwardRef((props: { branches: any[] } & BoxProps, ref) => {
  return (
    <Box component="ul" sx={{ pl: "1rem" }} ref={ref} {...props}>
      {renderMany(props.branches)}
    </Box>
  );
});

function Li(props: TypographyProps & TypographyOwnProps) {
  return (
    <Typography component="li" {...props}>
      {props.children}
    </Typography>
  );
}

function renderOne({
  label,
  path,
  children,
  tag,
}: {
  label: string;
  children: any[];
  path: string;
  tag?: Taguette.Tag;
}) {
  let [link] = useContext(ListContext);
  link = link && !!tag;
  let first = <strong>{!tag ? label : `${label}`}</strong>;
  first = link ? <Link to={`/tags/${tag!.id}`}>{first}</Link> : first;
  return (
    <Li key={label}>
      {first}
      {tag?.description && `: ${tag.description}`}

      <BranchUl branches={children} />
    </Li>
  );
}
function renderMany(branches: any[]) {
  return branches.map((branch) => renderOne(branch));
}

function CopyHtmlButton({
  contentRef,
}: {
  contentRef: RefObject<HTMLElement>;
}) {
  return (
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
      onClick={() => copyElementContentsToClipboard(contentRef.current!)}
    >
      <ContentCopyIcon />
      <HtmlIcon fontSize="large" sx={{ mx: 0.5 }} />
    </IconButton>
  );
}
