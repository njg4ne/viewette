import {
  fsAccessRoot,
  dbHandle,
  highlights,
  tags,
} from "../signals/Filesystems";

function taggingsQuery() {
  const q = `SELECT highlights.id as hid, highlight_tags.tag_id as tid FROM highlights JOIN highlight_tags ON highlights.id = highlight_tags.highlight_id;`;
  return q;
}
function tagLookupQuery() {
  const q = `SELECT DISTINCT tags.id as tid, tags.path as tag FROM highlights JOIN highlight_tags ON highlights.id = highlight_tags.highlight_id JOIN tags ON highlight_tags.tag_id = tags.id;`;
  return q;
}

async function accessFsBlob(handle) {
  if (!(handle instanceof FileSystemFileHandle))
    throw new Error("The provided handle is invalid.");
  const file = await handle.getFile();
  const blob = await file.arrayBuffer();
  return blob;
}

// async function getTags(highlightId) {
//   let query = `SELECT tag_id from highlight_tags WHERE highlight_id = ${highlightId};`;
//   // get a list of tags
//   const tagId = 0;
//   query = `SELECT path from tags WHERE id = 10;`;
// }

export async function getHighlights(rowOffset, rowLimit) {
  let query = "SELECT id, snippet FROM highlights;";
  const result = await safeQuery(query);
  if (!result) {
    highlights.value = [];
    return;
  }
  var { columns, values } = result;
  let hls = values.map(([id, snippet]) => {
    return { id, snippet };
  });
  var { columns, values } = await safeQuery(taggingsQuery());
  hls = values.reduce((acc, [hid, tid]) => {
    // go through hls and add the tag tags array within the hl obj ()
    let index = acc.findIndex((hl) => hl.id === hid);
    let hl = acc[index];
    if (!hl) return acc;
    if (!hl.tags) hl.tags = [];
    hl.tags.push(tid);
    acc[index] = hl;
    return acc;
  }, hls);
  var { columns, values } = await safeQuery(tagLookupQuery());
  tags.value = values.reduce((acc, [tid, tag]) => {
    acc[tid] = tag;
    return acc;
  }, {});
  //   console.log(hls);
  highlights.value = hls;
}

async function safeQuery(query) {
  if (!(dbHandle.value instanceof FileSystemFileHandle)) {
    return null;
  }
  let worker = new Worker("worker.sql-wasm.js");
  const dbBlob = await accessFsBlob(dbHandle.value);
  const res = await ousourceSql(worker, dbBlob, query);
  worker.terminate();
  const { buffer, results, s: queryTime } = res;
  let [result, ..._] = results;
  return result;
}

export async function ousourceSql(worker, blob, query) {
  if (!(blob instanceof ArrayBuffer))
    throw new Error("The provided blob is invalid.");
  if (typeof query !== "string")
    throw new Error("The provided query is invalid.");
  if (!worker) throw new Error("The provided worker is invalid.");

  let timer = Date.now();
  let openResolver, queryResolver, exportResolver;
  const openPromise = new Promise((resolve, reject) => {
    openResolver = resolve;
    // setTimeout(() => reject(new Error("SQL Open took too long")), 5000);
  });
  const queryPromise = new Promise((resolve, reject) => {
    queryResolver = resolve;
    // setTimeout(() => reject(new Error("SQL Query took too long")), 5000);
  });
  const exportPromise = new Promise((resolve, reject) => {
    exportResolver = resolve;
    // setTimeout(() => reject(new Error("SQL Export took too long")), 5000);
  });
  worker.addEventListener("message", (msg) => {
    const { id } = msg.data;
    if (id === "open") {
      openResolver(msg.data);
    } else if (id === "query") {
      queryResolver(msg.data);
    } else if (id === "export") {
      exportResolver(msg.data);
    }
  });
  worker.postMessage({
    action: "open",
    buffer: blob,
    id: "open",
  });
  const { ready } = await openPromise;
  if (!ready) throw new Error("SQL Open failed");
  worker.postMessage({
    action: "exec",
    sql: query,
    id: "query",
  });
  const { results } = await queryPromise;

  if (!Array.isArray(results)) throw new Error("SQL Query failed");
  worker.postMessage({
    action: "export",
    id: "export",
  });
  const { buffer } = await exportPromise;
  if (!(buffer instanceof Uint8Array)) throw new Error("SQL Export failed");
  timer = Date.now() - timer;
  timer /= 1000;
  const toRet = {
    results,
    buffer,
    s: timer,
  };
  return toRet;
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

async function writeDbToFile(handle, blob) {
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
}
async function getOpfsFileHandle(name) {
  const root = await navigator.storage.getDirectory();
  return await root.getFileHandle(name, { create: true });
}
async function writeDbToOpfs(name, blob) {
  const handle = await getOpfsFileHandle(name);
  await writeDbToFile(handle, blob);
}
async function readOpfsDb(name) {
  const handle = await getOpfsFileHandle(name);
  const file = await handle.getFile();
  const blob = await file.arrayBuffer();
  return blob;
}

export async function gainFsAccess() {
  const options = { id: "viewette", mode: "readwrite", startIn: "downloads" };
  window.showDirectoryPicker(options).then((h) => {
    console.log("setting signal");
    fsAccessRoot.value = h;
  });
}
