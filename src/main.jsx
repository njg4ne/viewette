import React, { useEffect, useState } from "preact/compat";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
// import { ListedHighights } from "./components/Highlight";
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
import {
  BrowserNotSupported,
  Draw,
  MailRounded,
  Tag,
} from "@mui/icons-material";
import {
  ColorThemeProvider,
  ColorModeToggler,
} from "./components/ColorModeTheme";
import { Paper } from "@mui/material";
import { FilesystemProvider } from "./contexts/FilesystemContext";
import DataViewer from "./components/DataViewer";
import {
  ForceExcludeTags,
  ForceIncludeTags,
  IncludeTags,
  RequireTags,
} from "./components/TagsFilter";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import EditHighlight from "./components/EditHighlight";
import EditTag from "./components/EditTag";
import Drawer from "./components/Drawer";
import Home from "./components/Home";
import DatabaseManager from "./components/DatabaseManager";
import EditHighlight from "./components/EditHighlight";

import SQL from "./components/SQL";
import Tags from "./components/Tags";
// import { tags } from "./signals";
import { TagAutocomplete, TagFilters } from "./components/Filters";
import TagTree from "./components/TagTree";

function Highlights() {
  const [dbHandle, setDbHandle] = useState(null);
  useEffect(() => {
    let utterance = new SpeechSynthesisUtterance(
      "Hi Claire. Zola has the stomach flu!"
    );
    console.log("Highlights mounted");
    window.speechSynthesis.speak(utterance);
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
      <Accordion elevation={3}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel-tag-filters-content"
          id="panel-tag-filters-header"
        >
          <Typography variant="h6">Tag Filters</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TagFilters />
        </AccordionDetails>
      </Accordion>
      <Paper elevation={3}>
        <DataViewer />
      </Paper>
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
          {/* 
            
              > */}
          <Drawer>
            {/* <Stack
              sx={{
                justifyContent: "space-between",
                // minHeight: "100vh",
                p: 2,
              }}
              spacing={2}
            > */}
            <Box sx={{ m: 2, flexGrow:1 }}>
              <Contents />
            </Box>
            {/* </Stack> */}
          </Drawer>
          {/* <ColorModeToggler /> */}

          {/* 
              
          */}
        </SnackbarProvider>
      </FilesystemProvider>
      {/* </ WorkerProvider> */}
    </ColorThemeProvider>
  );
};

const router = createHashRouter([
  {
    path: "/",
    // element: AppContainer({ Contents: Drawer }),
    element: AppContainer({ Contents: TagTree }),
    // element: AppContainer({ Contents: Home }),
  },
  {
    path: "/help",
    element: AppContainer({ Contents: Home }),
  },
  // {
  //   path: "/highlights",
  //   // element: AppContainer({ Contents: Drawer }),
  //   // element: AppContainer({ Contents: Highlights }),
  //   element: AppContainer({ Contents: null }),
  // },
  {
    path: "/db",
    element: AppContainer({ Contents: DatabaseManager }),
  },
  // {
  //   path: "/tree",
  //   element: AppContainer({ Contents: TagTree }),
  // },
  // {
  //   path: "/tags",
  //   element: AppContainer({ Contents: () => <Tags tags={tags} /> }),
  // },
  // {
  //   path: "/sql",
  //   element: AppContainer({ Contents: SQL }),
  // },
  {
    path: "/highlights/:id",
    element: AppContainer({ Contents: EditHighlight }),
    // element: AppContainer({ Contents: null }),
  },
  {
    path: "/tags/:id",
    element: AppContainer({ Contents: EditTag }),
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
