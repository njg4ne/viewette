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

import SQL from "./components/SQL";


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
        Viewette
      </Typography>
      {/* <Button variant="contained" onClick={opfs}>Export</Button> */}

      {/* <Typography variant="body1" sx={{}}>
        Content with link to <Link to="/test-router">/test-router</Link>.
      </Typography> */}
      {/*
       */}
      {/* <ListedHighights /> */}
      <Accordion elevation={3}>
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
      </Accordion>

      <Accordion elevation={3}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel-tag-filters-content"
          id="panel-tag-filters-header"
        >
          <Typography>Filter Tags</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <IncludeTags />
            <ForceExcludeTags />

          </Stack>
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
          <Container maxWidth={maxWidth} id="content">
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
    </ColorThemeProvider>
  );
};

const router = createHashRouter([
  {
    path: "/",
    element: AppContainer({ Contents: Home }),
  },
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
