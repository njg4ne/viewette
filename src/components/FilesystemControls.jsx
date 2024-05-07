import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
// import { useFilesystem } from '../contexts/FilesystemContext';
// import { useState } from 'react';
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

// import { databases, fsAccessRoot } from "../signals";
// import { gainFsAccess, getHighlights } from "../utils/sql";
import { SnackbarProvider, useSnackbar } from "notistack";
async function write10Files(handle) {
  // writes files with names 1.txt, 2.txt, ... 10.txt containing the number
  for (let i = 1; i <= 10; i++) {
    const name = `${i}.txt`;
    const touch = async (place, name) =>
      await place.getFileHandle(name, { create: true });
    const file = await touch(handle, name);
    const writable = await file.createWritable();
    // encode the text of the number as utf-8
    const encoder = new TextEncoder();
    const data = encoder.encode(`${i}`);
    await writable.write(data);
    await writable.close();
  }
}

// function to read all the .sqlite3 files in the filesystem
async function readSqlFiles(handle) {
  if (handle.kind !== "directory") return null;
  let files = [];
  const ending = ".sqlite3";
  for await (const fileHandle of handle.values()) {
    if (fileHandle.kind === "file" && fileHandle.name.endsWith(ending)) {
      files.push(fileHandle);
    }
  }
  return files.map((f) => f.name);
}

export default function FileSystemControls() {
  const label = {
    inputProps: { "aria-label": "Filesystem Activation Switch" },
  };
  // const [handle, setHandle] = useFilesystem().handle;
  // const query = useFilesystem().query;

  function fsDo() {
    enqueueSnackbar("Getting Highlights");
    getHighlights(0, 7);
    // enqueueSnackbar("Query", /*dont duplicate*/ { preventDuplicate: true });
    // const sql = "SELECT id, snippet FROM highlights;";
    // query(sql).then(console.log);
  }
  //const [files, setFiles] = useState([]);
  const files = databases.value.map((d) => d.name);

  // function initFilesystem() {
  //     const options = { id: "viewette", mode: "readwrite", startIn: "downloads" };
  //     window.showDirectoryPicker(options).then(h => {
  //         setHandle(h);
  //         // write10Files(h);
  //         readSqlFiles(h).then(setFiles);
  //     }
  //     );
  // }

  const on = Boolean(fsAccessRoot.value instanceof FileSystemDirectoryHandle);
  function toggle() {
    if (on) {
      fsAccessRoot.value = null;
    } else gainFsAccess();
  }
  const handle = fsAccessRoot.value;
  const path = handle ? handle.name : "";
  const pathMsg = handle ? `Mounted to "${path}"` : "Not Mounted";
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  return (
    <Box
      id="fs-control"
      sx={{ width: "minContent", alignSelf: "", p: 2 }}
    // elevation={6}
    >
      <Stack spacing={2} alignItems="center">
        <Typography component="label" htmlFor="fs-control">
          Filesystem
        </Typography>
        {/* <Button variant="contained" onClick={fsDo}>
          Query
        </Button> */}
        <Switch {...label} checked={on} onChange={toggle} />
        <Typography variant="p">{pathMsg}</Typography>
        {/* <List
          component={Card}
          subheader={<ListSubheader>Files</ListSubheader>}
          sx={{ width: "50%" }}
        >
          {files.map((f, i) => (
            <ListItem key={i} disablePadding divider sx={{ px: 1 }}>
              <ListItemText primary={f} />
            </ListItem>
          ))}
        </List> */}
      </Stack>
    </Box>
  );
}
