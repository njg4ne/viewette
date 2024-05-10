// from https://mui.com/material-ui/react-button/#file-upload
import * as React from "preact/compat";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import { loadOpfsDb, clearOpfsDb } from "../signals";
import { ButtonGroup } from "@mui/material";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function DatabaseManager() {
  async function onFormChange(f) {
    const name = "database.sqlite3";
    const root = await navigator.storage.getDirectory();
    const exists = await root
      .getFileHandle(name)
      .then(() => true)
      .catch(() => false);
    let confirm = !exists;
    const phrase = "del";
    const msg = `Continuing will overwrite the current database saved in your browser. This action cannot be undone. Please type "${phrase}" to continue?`;
    let decision = "undecided";
    while (!confirm && decision !== phrase && decision !== null) {
      decision = window.prompt(msg);
    }
    confirm = confirm || decision === phrase;
    if (confirm) {
      let formData = new FormData(f);
      let file = formData.get("upload-database");
      file = new File([file], "database.sqlite3", {
        type: "application/x-sqlite3",
      });
      // save this file to opfs
      // let root = await navigator.storage.getDirectory();
      const dbFileHandle = await root.getFileHandle("database.sqlite3", {
        create: true,
      });
      const writable = await dbFileHandle.createWritable();
      await writable.write(file);
      await writable.close();
      console.log("Database saved to OPFS");
      // reload the page
      loadOpfsDb();
    }
    f.reset();
  }
  async function clearOpfs() {
    const name = "database.sqlite3";
    const root = await navigator.storage.getDirectory();
    const exists = await root
      .getFileHandle(name)
      .then(() => true)
      .catch(() => false);
    let confirm = !exists;
    const phrase = "del";
    const msg = `Continuing will delete all data in OPFS storage. This action cannot be undone. Please type "${phrase}" to continue?`;
    let decision = "undecided";
    while (!confirm && decision !== phrase && decision !== null) {
      decision = window.prompt(msg);
    }
    confirm = confirm || decision === phrase;
    if (confirm) {
      async function deleteRecursive(dirHandle) {
        for await (const [name, handle] of dirHandle.entries()) {
          if (handle.kind === "file") {
            console.log("Deleting file: ", handle.name);
            await handle.remove();
          } else if (handle.kind === "directory") {
            console.log("Deleting directory: ", handle.name);
            await deleteRecursive(handle);
          }
        }
      }
      await deleteRecursive(root);
      clearOpfsDb();
    }
  }
  async function downloadDatabase() {
    const name = "database.sqlite3";
    const root = await navigator.storage.getDirectory();
    const exists = await root
      .getFileHandle(name)
      .then(() => true)
      .catch(() => false);
    if (!exists) {
      alert("There is no database in OPFS to download.");
      return;
    }
    const dbFileHandle = await root.getFileHandle("database.sqlite3", {
      create: false,
    });
    const file = await dbFileHandle.getFile();
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  }

  return (
    <Box
      component="form"
      method="post"
      encType="multipart/form-data"
      sx={{ alignSelf: "center" }}
    >
      <Button
        sx={{ width: "100%" }}
        component="label"
        variant="contained"
        startIcon={<CloudUploadIcon />}
        htmlFor="upload-database"
        color="secondary"
      >
        Upload database
        <VisuallyHiddenInput
          type="file"
          accept=".sqlite3"
          id="upload-database"
          name="upload-database"
          onChange={(e) => {
            onFormChange(e.target.form);
          }}
        />
      </Button>

      <Button
        sx={{ width: "100%", marginTop: "1rem" }}
        variant="contained"
        color="secondary"
        onClick={clearOpfs}
        startIcon={<DeleteForeverIcon />}
      >
        Clear uploaded
      </Button>

      <Button
        sx={{ width: "100%", marginTop: "1rem" }}
        variant="contained"
        color="secondary"
        onClick={downloadDatabase}
        startIcon={<CloudDownloadIcon />}
      >
        Download database
      </Button>
    </Box>
  );
}
