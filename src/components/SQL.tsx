// import workerUrl from "./workers/worker.js?url";

// import sqlWorkerUrl from "./mimic/sqlite3/worker1.js?url";
// import "./mimic/sqlite3/promiser.js";
import { useEffect } from "preact/compat";
// import { signal, effect } from "@preact/signals-react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import HeaderTestWorkerUrl from "../workers/worker.js?url";
import UploadDatabase from "./DatabaseManager";

declare global {
  interface FileSystemDirectoryHandle {
    entries(): Iterator<FileSystemHandle>;
  }
}

import OpfsDb, { TaguetteDb } from "../db";
async function opfs() {
  const opfsRoot: FileSystemDirectoryHandle =
    await navigator.storage.getDirectory();
  // navigator.storage.remo
  const fileHandle = await opfsRoot.getFileHandle("abc.txt", {
    create: true,
  });
  // print all files in opfsRoot
  // @ts-expect-error
  for await (const entry of opfsRoot.values()) {
    console.log("OPFS Root Contains: ", entry.name);
    // print the size of each file
    const file = await entry.getFile();
    console.log("File Size: ", file.size);
  }
}
async function test() {
  // const name = "viewette"
  const db = new TaguetteDb();
  // let est: StorageEstimate = (await navigator.storage.estimate())
  // console.log(est)
  // console.log(Number(quota) / 1000000000, Number(usage) / 1000000000)
  let bind = [1, 2, 4];
  let sql = `DROP TABLE IF EXISTS test;
    CREATE TABLE IF NOT EXISTS test (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        age INTEGER
    ); 
    INSERT INTO test (age) VALUES (?), (?);
    INSERT INTO test (age) VALUES (?);
    SELECT * FROM test;
    DROP TABLE IF EXISTS test;`;
  // sql += `CREATE TABLE IF NOT EXISTS users
  // (id INTEGER PRIMARY KEY AUTOINCREMENT,
  // first_name TEXT,
  // last_name TEXT);`;

  // sql += `INSERT INTO users (first_name, last_name) VALUES ('John', 'Doe'), ('Jane', 'Doe');`;
  // sql += `SELECT * FROM users; COMMIT;`;
  // sql = `SELECT * from highlights;`
  // sql = `SELECT highlights.id as hid, highlight_tags.tag_id as tid FROM highlights JOIN highlight_tags ON highlights.id = highlight_tags.highlight_id`;
  // open, drop, close for both
  console.log(await db.open("database"));
  const res = await db.exec(sql, "array", bind);
  // console.log(res.workerRespondTime - res.workerReceivedTime)
  console.log(res.result);
  console.log(await db.close());
  // await opfs();
}
// db.exec(`DROP TABLE IF EXISTS users; `)

// import sqlite3 from "../sqlite3-bundler-friendly/sqlite3-bundler-friendly.mjs";
// import sqlite3Worker1Url from "../sqlite3-bundler-friendly/sqlite3-worker1-bundler-friendly.mjs?url";
// import "../sqlite3-bundler-friendly/sqlite3-opfs-async-proxy.js";
// import "../sqlite3-bundler-friendly/sqlite3-worker1-promiser-bundler-friendly.js";

// const sqlerReady = signal(null)
// let sqler = sqlite3Worker1Promiser({
//     // worker: new Worker(sqlite3Worker1Url),
//     onready: () => {
//         sqlerReady.value = true;
//         console.log("sqler ready");
//     },
// });

// const onRow = ({ columnNames, row, rowNumber }) => {
//     if (row === undefined) {
//         console.log(`No more rows returned`);
//         return
//     }
//     console.log(`Row[${ rowNumber }]callback: `, Object.fromEntries(columnNames.map((name, i) => [name, row[i]])));
// }

// async function exec(sql = ";", messageId = undefined, dbId = undefined, onRow = () => { }) {
//     const res = await sqler("exec", {
//         dbId,
//         messageId,
//         sql: sql,
//         saveSql: [],
//         callback: onRow,
//         resultRows: []
//     });
//     const now = performance.now();
//     const ms2 = now - res.departureTime;
//     const ms1 = res.workerRespondTime - res.workerReceivedTime
//     const ms = Math.round((ms2) * 100) / 100;
//     const { result: { saveSql: sqls, resultRows: rows, columnNames: cols, dbId: did, messageId: mid } } = res;
//     return { id: mid, ms, cols, rows, sqls };
// }

// async function test() {
//     const db = "viewette.sqlite3"
//     let res = await sqler("open", { filename: `file:${ db }?vfs = opfs` });
//     const { result: { dbId } } = res;
//     console.log("opened database: ", dbId, res.result);

//     let sql = `DROP TABLE IF EXISTS users; `
//     sql += `CREATE TABLE IF NOT EXISTS users
//   (id INTEGER PRIMARY KEY AUTOINCREMENT,
//   first_name TEXT,
//   last_name TEXT);`;
//     sql += `INSERT INTO users (first_name, last_name) VALUES ('John', 'Doe'), ('Jane', 'Doe');`;
//     sql += `SELECT * FROM users;`;
//     sql += `SELECT first_name FROM users;`;
//     let bind = [];
//     res = await exec(sql);
//     console.log("executed sql: ", res);
//     sql = `SELECT first_name FROM users;`;
//     res = await exec(sql);
//     console.log("executed sql: ", res);

//     // res = await sqler("exec", {
//     //   dbId,
//     //   messageId: "create-users-table",
//     //   sql: sql,
//     //   saveSql: [],
//     //   // rowMode: 'array', // not 'object'
//     //   callback: ({ columnNames, row, rowNumber }) => {
//     //     if (row === undefined) {
//     //       console.log(`No more rows returned`);
//     //       return
//     //     }
//     //     console.log(`Row [${rowNumber}] callback: `, Object.fromEntries(columnNames.map((name, i) => [name, row[i]])));
//     //   },
//     //   // resultRows: []
//     // });

//     // console.log("executed sql: ", res);
//     // res = await sqler("exec", { dbId, messageId: "select-users", sql: `SELECT * FROM users;` });
//     // console.log("executed sql: ", res.result);
//     res = await sqler("close", { db });
//     console.log("closed database: ", res.result);
// }

// effect(() => {
//     // console.log("sqlerReady changed: ", sqlerReady.value)
//     if (sqlerReady.value) {
//         test();
//     }
// })
// async function opfs() {
//     const db = "viewette"
//     const opfsRoot = await navigator.storage.getDirectory();
//     const fileHandle = await opfsRoot.getFileHandle(`${db}.sqlite3`);
//     const file = await fileHandle.getFile()
//     const url = URL.createObjectURL(file);
//     const a = document.createElement("a");
//     a.href = URL.createObjectURL(await fileHandle.getFile())
//     a.download = "viewette.sqlite3";
//     a.click();
//     a.remove();
// }
// opfs();

export default function SQL({}) {
  function onMount() {
    let w = new Worker(HeaderTestWorkerUrl);
    const onUnmount = () => w.terminate();
    return onUnmount;
  }
  useEffect(onMount, []);
  return (
    <Stack sx={{ alignItems: "center", py: 2 }} spacing={2}>
      <Typography variant="h4" sx={{ textAlign: "center" }}>
        Viewette
      </Typography>
      <UploadDatabase />
      <Typography sx={{}}>Viewette</Typography>
      <Button variant="contained" onClick={test}>
        Test SQL
      </Button>
    </Stack>
  );
}
