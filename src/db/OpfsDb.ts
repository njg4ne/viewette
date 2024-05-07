import { sqlite3Worker1Promiser } from "@sqlite.org/sqlite-wasm";
import queries from "./models/sql";

type TransactionParams = {
  sql: string;
  bindings?: Record<string, any>;
  rowMode?: "array" | "object";
};

export default class OpfsDb {
  #dbName: string = "opfsDatabase";
  ready: Promise<void> = new Promise(() => {});
  constructor(name?: string) {
    console.log("OpfsDb constructor");
    if (name) {
      this.#dbName = name;
    }
    this.ready = this.open(this.#dbName).then((res) => void 0);
  }
  #sqlite: SQLite3.Worker1.Promiser | null = null;
  static #Fail = async () =>
    await Promise.reject("SQLite was not initialized properly");

  /**
   *
   * @param name Name to give the database file (excluding extension)
   * @returns The result of the open command from sqlite3
   */
  async open(name: string): Promise<SQLite3.Worker1.Response> {
    type F = Function;
    let onResolve: F = () => {};
    let onReject: F = () => {};
    const promise = new Promise((res: F, rej: F) => {
      onResolve = res;
      onReject = rej;
    });
    this.#sqlite = /*(globalThis as any).*/ sqlite3Worker1Promiser({
      onready: () => {
        onResolve();
      },
    });
    await promise;
    if (this.#sqlite !== null) {
      return await this.#sqlite("open", {
        filename: `file:${name}.sqlite3?vfs=opfs`,
      });
    } else {
      return OpfsDb.#Fail();
    }
  }
  /**
   * Closes the specified sqlite3 database
   * @param dbId The sqlite3 database id
   * @returns The result of the close command from sqlite3
   */
  async close(): Promise<SQLite3.Worker1.Response> {
    if (this.#sqlite !== null) {
      return await this.#sqlite("close", {});
    } else {
      return OpfsDb.#Fail();
    }
  }

  async exec(
    sql: string,
    rowMode: "array" | "object" = "array",
    bindings: Record<string, any> = {}
  ): Promise<SQLite3.Worker1.Response> {
    await this.ready;
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
        // returnValue "this" | "resultRows" | "saveSql"
        bind: bindings,
        rowMode,
        resultRows: [],
        columnNames: [],
      });
    } else {
      return OpfsDb.#Fail();
    }
  }

  async transact(
    sql: string,
    rowMode: "array" | "object" = "object",
    bindings?: Record<string, any>
  ) {
    const q = `BEGIN;${sql}COMMIT;`;
    try {
      const res = await this.exec(q, rowMode, bindings);
      return Promise.resolve(res);
    } catch (e) {
      // return Promise.reject(e);
      await this.exec("ROLLBACK;");
      return Promise.reject(e);
    }
  }
  async transactAll(requests: TransactionParams[]) {
    const rows2dArr = [];
    for (let { sql, bindings, rowMode } of requests) {
      rowMode = rowMode ?? "object";
      const res = await this.transact(sql, rowMode, bindings);
      const rows = res?.result?.resultRows ?? [];
      rows2dArr.push(rows);
    }
    return rows2dArr;
  }
  // async *transactIterate(requests: TransactionParams[]) {
  //   for (let { sql, bindings, rowMode } of requests) {
  //     rowMode = rowMode ?? "object";
  //     const start = performance.now();
  //     const res = await this.transact(sql, rowMode, bindings);
  //     const end = performance.now();
  //     console.log(`Worker took ${end - start}ms`);
  //     yield res?.result?.resultRows ?? [];
  //   }
  // }
  // async transactAll(requests: TransactionParams[]) {
  //   const rows2dArr = [];
  //   for await (const rows of this.transactIterate(requests)) {
  //     rows2dArr.push(rows);
  //   }
  //   return rows2dArr;
  // }

  async collection(name: string) {
    const bindings = { $collection: name };
    const response = await this.transact(
      queries.validateCollection,
      "object",
      bindings
    );
    let { existence } = response?.result?.resultRows?.at(0) ?? {};
    existence = Boolean(existence);
    if (!existence) throw `Collection ${name} does not exist.`;
  }
}
