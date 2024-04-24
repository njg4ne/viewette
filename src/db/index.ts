import OpfsDb from "./OpfsDb";
import TaguetteDb from "./models/TaguetteDb";
export default OpfsDb;
export { OpfsDb, TaguetteDb };

// let sqler = sqlite3Worker1SQLite3.Worker1.Promiser({
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
