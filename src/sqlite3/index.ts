import "./sqlite3-opfs-async-proxy.js";
import "./sqlite3-worker1-promiser-bundler-friendly.js";
import { SQLite3Error } from "./sqlite3.js";

type Command = "open" | "close" | "config-get" | "exec" | "export"

type Promiser = (command: Command, config: Record<string, any>) => Promise<any>;

// workerReceivedTime: number, workerRespondTime: number, departureTime: number }>;
type SqliteResponse = {
    dbId: string
    departureTime: number
    messageId: string
    result: {}
    type: Command
    workerReceivedTime: number
    workerRespondTime: number
}

export default class OpfsDb {
    #sqlite: Promiser | null = null;
    static #Fail = async () => await Promise.reject("SQLite was not initialized properly");

    /**
     * 
     * @param name Name to give the database file (excluding extension)
     * @returns The result of the open command from sqlite3
     */
    async open(name: string): Promise<SqliteResponse> {
        type F = Function;
        let onResolve: F = () => { };
        let onReject: F = () => { };
        const promise = new Promise((res: F, rej: F) => {
            onResolve = res;
            onReject = rej;
        });
        this.#sqlite = (globalThis as any).sqlite3Worker1Promiser({
            onready: () => {
                console.log("sqlite is ready on a worker thread");
                onResolve();
            },
            onerror: (e: SQLite3Error) => {
                onReject(e);
            }
        });
        await promise;
        if (this.#sqlite !== null) {
            return await this.#sqlite("open", { filename: `file:${name}?vfs=opfs` });
        } else {
            return OpfsDb.#Fail();
        }
    }
    /**
     * Closes the specified sqlite3 database
     * @param dbId The sqlite3 database id
     * @returns The result of the close command from sqlite3
     */
    async close(): Promise<SqliteResponse> {
        if (this.#sqlite !== null) {
            return await this.#sqlite("close", {});
        } else {
            return OpfsDb.#Fail();
        }
    }

    async exec(sql: string) {
        if (this.#sqlite !== null) {
            return await this.#sqlite("exec", {
                // dbId,
                // messageId,
                sql: sql,
                saveSql: [],
                // callback: ({ columnNames, row, rowNumber }: { columnNames: string[], row: any[], rowNumber: number }) => {
                //     if (row === undefined) {
                //         console.log(`No more rows returned`);
                //         return
                //     }
                //     console.log(`Row [${rowNumber}] callback: `, Object.fromEntries(columnNames.map((name, i) => [name, row[i]])));
                // }
                resultRows: []
            });
        } else {
            return OpfsDb.#Fail();
        }
    }

}

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