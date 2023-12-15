// import workerUrl from "./workers/worker.js?url";

// import sqlWorkerUrl from "./mimic/sqlite3/worker1.js?url";
// import "./mimic/sqlite3/promiser.js";
import { useEffect } from "react";
import { signal, effect } from "@preact/signals-react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import HeaderTestWorkerUrl from "../workers/worker.js?url";


import OpfsDb from "../sqlite3"

async function test() {
    // const name = "viewette"
    const db = new OpfsDb();
    let sql = `DROP TABLE IF EXISTS users;`
    sql += `CREATE TABLE IF NOT EXISTS users 
    (id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT,
    last_name TEXT);`;
    sql += `INSERT INTO users (first_name, last_name) VALUES ('John', 'Doe'), ('Jane', 'Doe');`;
    sql += `SELECT * FROM users;`;
    // open, drop, close for both
    console.log(await db.open("db"));
    console.log(await db.exec(sql));
    console.log(await db.close());

}
// db.exec(`DROP TABLE IF EXISTS users;`)

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
//     console.log(`Row [${rowNumber}] callback: `, Object.fromEntries(columnNames.map((name, i) => [name, row[i]])));
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
//     let res = await sqler("open", { filename: `file:${db}?vfs=opfs` });
//     const { result: { dbId } } = res;
//     console.log("opened database: ", dbId, res.result);

//     let sql = `DROP TABLE IF EXISTS users;`
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

export default function SQL({ }) {
    function onMount() {
        let w = new Worker(HeaderTestWorkerUrl);
        const onUnmount = () => w.terminate();
        return onUnmount;
    }
    useEffect(onMount, []);
    return <Stack sx={{ alignItems: "center", py: 2 }} spacing={2}>
        <Typography variant="h4" sx={{ textAlign: "center" }}>
            Viewette
        </Typography>
        <Typography sx={{}}>
            Viewette
        </Typography>
        <Button variant="contained" onClick={test}>Test SQL</Button>

    </Stack>
}