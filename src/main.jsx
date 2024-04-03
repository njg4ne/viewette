import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { ListedHighights } from "./components/Highlight";
import FileSystemControls from "./components/FilesystemControls";
import "./styles/colors.css";
import "./styles/main.css";

import { SnackbarProvider } from "notistack";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import CssBaseline from "@mui/material/CssBaseline";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { BrowserNotSupported, MailRounded } from "@mui/icons-material";
import {
  ColorThemeProvider,
  ColorModeToggler,
} from "./components/ColorModeTheme";
import { Paper } from "@mui/material";
import { FilesystemProvider } from "./contexts/FilesystemContext";
import DataViewer from "./components/DataViewer";
import { ForceExcludeTags, ForceIncludeTags, IncludeTags, RequireTags } from "./components/TagsFilter";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditHighlight from "./components/EditHighlight";

import UploadDatabase from "./components/UploadDatabase";

import SQL from "./components/SQL";
import Tags from "./components/Tags";
import { tags } from "./signals/Filesystems";
import { TagAutocomplete, TagFilters } from "./components/Filters";


function Home() {
  const [dbHandle, setDbHandle] = useState(null);
  useEffect(() => {
    // console.log("Home mounted");
    // const worker = new Worker(workerUrl);
    // return () => {
    //   // console.log("Home unmounted");
    //   worker.terminate();
    // }

  }, []);
  // const worker = useWorker();
  // listenToWorker((msg) => {
  //   console.log("Worker told Home something: ", msg.data);
  // });

  return (
    <Stack sx={{ alignItems: "stretch", py: 2 }} spacing={2}>
      <Typography variant="h4" sx={{ textAlign: "center" }}>
        Viewette (Taguette 2.0 Prototype)
      </Typography>
      <Accordion elevation={3}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel-instructions-content"
          id="panel-instructions-header"
        >
          <Typography variant="h5" >
            Instructions
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Typography variant="body1" sx={{}}>
              Upload a .sqlite3 database file exported from <Link to="https://www.taguette.org/">Taguette</Link> to view your data. A copy will be saved to your browser to edit. Click on a table row to edit the tags on a highlight. Navigate to <Link to="/tags">/tags</Link> to edit the tag hierarchy using drag and drop!
            </Typography>
            <Typography variant="body1" sx={{}}>
              Unsupported features include managing documents or projects, editing tags by path, merging tags, exporting data, or editing highlights. Please use <Link to="https://www.taguette.org/">Taguette</Link> for these features at this time.
            </Typography>

          </Stack>
        </AccordionDetails>
      </Accordion>
      <Accordion elevation={3}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel-database-file-control-content"
          id="panel-database-file-control-header"
        >
          <Typography variant="h5" >
            Manage Database File
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <UploadDatabase />
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* <Button variant="contained" onClick={opfs}>Export</Button> */}

      {/* <Typography variant="body1" sx={{}}>
        Content with link to <Link to="/test-router">/test-router</Link>.
      </Typography> */}
      {/*
       */}
      {/* <ListedHighights /> */}
      {/* <Accordion elevation={3}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel-filesystem-content"
          id="panel-filesystem-header"
        >
          <Typography>Filesystem Access</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FileSystemControls />
        </AccordionDetails>
      </Accordion> */}

      <Accordion elevation={3}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel-tag-filters-content"
          id="panel-tag-filters-header"
        >
          <Typography variant="h5">Filter Tags</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {/* <Stack spacing={2}>
            <IncludeTags />
            <ForceExcludeTags />
            <TagAutocomplete />

          </Stack> */}
          <TagFilters />
        </AccordionDetails>
      </Accordion>

      <DataViewer />
    </Stack>
  );
}

const AppContainer = ({ Contents }) => {

  // get max width based on screen size
  const maxWidth = /* options are: xs, sm, md, lg, xl */ "md";
  return (
    <ColorThemeProvider>
      <CssBaseline enableColorScheme />
      {/* <WorkerProvider> */}
      <FilesystemProvider>
        <SnackbarProvider>
          <Container maxWidth={maxWidth} id="content" sx={{}}>
            <Paper elevation={3} component="main" sx={{}}>
              <Stack
                sx={{
                  justifyContent: "space-between",
                  minHeight: "100vh",
                  p: 2,
                }}
                spacing={2}
              >
                <Contents />
                <footer>
                  <ColorModeToggler />
                </footer>
              </Stack>
            </Paper>
          </Container>
        </SnackbarProvider>
      </FilesystemProvider>
      {/* </ WorkerProvider> */}
    </ColorThemeProvider >
  );
};

const router = createHashRouter([
  {
    path: "/",
    element: AppContainer({ Contents: Home }),
  },
  // {
  //   path: "/tags",
  //   element: AppContainer({ Contents: () => <Tags tags={tags} /> }),
  // },
  {
    path: "/sql",
    element: AppContainer({ Contents: SQL }),
  },
  {
    path: "/highlights/:id",
    element: AppContainer({ Contents: EditHighlight }),
  },
  {
    path: "/test-router",
    element: AppContainer({
      Contents: () => (
        <Typography variant="h3" sx={{ textAlign: "center", p: 5 }}>
          Router Test Success
        </Typography>
      ),
    }),
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
