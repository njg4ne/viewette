import * as React from "react";
import { Button } from "@mui/material";
// import { useFilesystem, initFilesystem } from '../contexts/FilesystemContext';

const contextValueFormat = {};
const FilesystemContext = React.createContext(contextValueFormat);

export const useFilesystem = () => React.useContext(FilesystemContext);

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
async function getSqlFile(handle) {
  if (handle.kind !== "directory") return null;
  let files = [];
  const ending = ".sqlite3";
  for await (const fileHandle of handle.values()) {
    if (fileHandle.kind === "file" && fileHandle.name.endsWith(ending)) {
      files.push(fileHandle);
    }
  }
  if (files.length === 0)
    throw new Error("No sqlite3 files found in the directory.");
  return files[0];
}
async function readSqlFile(handle) {
  const fileHandle = await getSqlFile(handle);
  const file = await fileHandle.getFile();
  const blob = await file.arrayBuffer();
  return blob;
}
async function writeSqlFile(handle, blob) {
  console.log("Writing SQL Database to filesystem");
  const fileHandle = await getSqlFile(handle);
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
  return true;
}
async function opfsWrite(fsHandle, blob) {
  const name = "viewette.sqlite3";
  const root = await navigator.storage.getDirectory();
  const handle = await root.getFileHandle(name, { create: true });
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
  await writeSqlFile(fsHandle, blob);
  return true;
}

// sqlite query get id, snippet from the table highlights
const Q = "SELECT id, snippet FROM highlights;";

export function FilesystemProvider({ children }) {
  const useHandle = React.useState(null);
  // let worker = new Worker("worker.sql-wasm.js");
  // const onmsg = msg => console.log("Message from worker to filesystem:", msg.data);
  // worker.addEventListener('message', onmsg);

  // worker.postMessage({
  //     action: "open",
  //     buffer: new ArrayBuffer(0)
  // });
  React.useEffect(() => {
    // return () => {
    //   worker.terminate();
    // };
  }, []);

  // const query = "SELECT id, snippet FROM highlights;"
  async function query(sql) {
    const promise = new Promise((resolve, reject) => {
      openQueryReturn(worker, dbBlob, sql).then((res) => {
        const { s, results, buffer } = res;
        const [handle, _] = useHandle;
        console.log("Query took", s * 1000, "ms");
        const startTime = Date.now();
        if (handle)
          opfsWrite(handle, buffer).then((_) => {
            resolve(results);
            console.log(
              `Writing to filesystem took ${Date.now() - startTime} ms`
            );
          });
      });
    });
    return await promise;
  }

  const [dbBlob, setDbBlob] = React.useState(null);
  const value = {
    handle: useHandle,
    query,
  };
  React.useEffect(() => {
    const [handle, _] = useHandle;
    if (!handle) return;
    readSqlFile(handle).then(setDbBlob);
  }, [useHandle[0]]);

  React.useEffect(() => {
    if (!dbBlob) return;
    console.log("dbBlob changed to", dbBlob);
    worker.addEventListener("message", (msg) => {
      console.log("Message from worker:", msg.data);
    });
    worker.postMessage({
      action: "open",
      buffer: dbBlob,
    });
  }, [dbBlob]);
  return (
    <FilesystemContext.Provider value={value}>
      {/* <Button onClick={() => openQueryReturn(worker, dbBlob, query)}>Open</Button> */}

      {children}
    </FilesystemContext.Provider>
  );
}
