import "./sqlite3-opfs-async-proxy.js";
import "./sqlite3-worker1-promiser-bundler-friendly.js";
import { SQLite3Error } from "./sqlite3.js";
import "./sqlite3-bundler-friendly.mjs";
// import "./sqlite3.js";

type Command = "open" | "close" | "config-get" | "exec" | "export";

type Promiser = (command: Command, config: Record<string, any>) => Promise<any>;

// workerReceivedTime: number, workerRespondTime: number, departureTime: number }>;
type SqliteResponse = {
  dbId: string;
  departureTime: number;
  messageId: string;
  result: {};
  type: Command;
  workerReceivedTime: number;
  workerRespondTime: number;
};

export default class OpfsDb {
  #sqlite: Promiser | null = null;
  static #Fail = async () =>
    await Promise.reject("SQLite was not initialized properly");

  /**
   *
   * @param name Name to give the database file (excluding extension)
   * @returns The result of the open command from sqlite3
   */
  async open(name: string): Promise<SqliteResponse> {
    type F = Function;
    let onResolve: F = () => {};
    let onReject: F = () => {};
    const promise = new Promise((res: F, rej: F) => {
      onResolve = res;
      onReject = rej;
    });
    this.#sqlite = (globalThis as any).sqlite3Worker1Promiser({
      onready: () => {
        // console.log("sqlite is ready on a worker thread");
        onResolve();
      },
      onerror: (e: SQLite3Error) => {
        onReject(e);
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
  async close(): Promise<SqliteResponse> {
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
  ): Promise<SqliteResponse> {
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
        bind: bindings,
        rowMode,
        resultRows: [],
        columnNames: [],
      });
    } else {
      return OpfsDb.#Fail();
    }
  }
}

// make a class that extends opfsdb called TaguetteDb that has methods for each of the taguette queries
export class TaguetteDb extends OpfsDb {
  #qTaggings: string = `SELECT highlights.id as hid, highlight_tags.tag_id as tid FROM highlights JOIN highlight_tags ON highlights.id = highlight_tags.highlight_id;`;
  #qTagLookup: string = `SELECT DISTINCT tags.id as tid, tags.path as tag FROM highlights JOIN highlight_tags ON highlights.id = highlight_tags.highlight_id JOIN tags ON highlight_tags.tag_id = tags.id;`;
  #qHighlightsLookup: string = "SELECT id, snippet FROM highlights;";
  #qHighlightById: string = "SELECT snippet FROM highlights WHERE id = ?;";
  #qHighlighAio: string = `SELECT highlights.id, highlights.snippet, GROUP_CONCAT(tags.path) AS tags, GROUP_CONCAT(tags.id) AS tagIds FROM highlights LEFT JOIN highlight_tags ON highlights.id = highlight_tags.highlight_id LEFT JOIN tags ON highlight_tags.tag_id = tags.id GROUP BY highlights.id;`;
  #qTags = `SELECT tags.id as tagId, tags.path as tag FROM tags;`;
  #highlightRowConverter = ({
    id,
    snippet,
    tags,
    tagIds,
  }: {
    id: number;
    snippet: string;
    tags: string;
    tagIds: string;
  }) => ({
    id,
    snippet,
    tags: tags === null ? [] : tags.split(","),
    tagIds: tagIds === null ? [] : tagIds.split(",").map(Number),
  });
  async getHighlights() {
    const t0 = performance.now();
    // @ts-expect-error
    const {
      result: { resultRows },
      workerReceivedTime: t1,
      workerRespondTime: t2,
    } = await this.exec(this.#qHighlighAio, "object");
    const t3 = performance.now();
    return resultRows.map(this.#highlightRowConverter);
  }
  async getHighlight($hid: number) {
    const bindings = { $hid };
    const q = `
    SELECT 
      highlights.id,
      highlights.snippet,
      Group_concat(tags.path) AS tags,
      Group_concat(tags.id) AS tagIds
    FROM highlights 
      LEFT JOIN highlight_tags
        ON highlights.id = highlight_tags.highlight_id
      LEFT JOIN tags
        ON highlight_tags.tag_id = tags.id
      WHERE highlights.id = $hid
    ;`;
    // const { result: { resultRows } } = await this.exec(q, "object", bindings);
    const response = await this.exec(q, "object", bindings);
    // @ts-expect-error
    const result =
      response?.result?.resultRows?.map(this.#highlightRowConverter).at(0) ??
      null;
    // console.log(result);
    return result;
  }
  async createTag($path: string, $description = "") {
    const bindings = { $path, $description };
    let q = `SELECT projects.id FROM projects LIMIT 1`;
    q = `INSERT INTO tags (project_id, path, description) VALUES ((${q}), $path, $description);`;
    try {
      const { result } = await this.exec(q, "object", bindings);
      return Promise.resolve($path);
    } catch (e) {
      const message = e?.result?.message ?? "?:";
      const type = message.split(":")[0];
      switch (type) {
        case "SQLITE_CONSTRAINT_UNIQUE":
          return Promise.reject(`Tag '${$path}' already exists`);
          break;
        default:
          return Promise.reject(`Unknown error: ${message}`);
      }
    }
  }

  async getTags() {
    // @ts-expect-error
    const {
      result: { resultRows },
    } = await this.exec(this.#qTags);
    return resultRows.reduce(
      (acc: Record<number, string>, [tagId, tag]: [number, string]) => {
        acc[tagId] = tag;
        return acc;
      },
      {}
    );
  }
  async updateTagsForHighlight(hid: number, remove: number[], add: number[]) {
    // let bindings: Record<string, any> = { $hid: hid };
    let bindings: Array<any> = [hid];
    let q = "BEGIN;";
    // console.log(remove, add);
    if (remove.length > 0) {
      bindings = [...bindings, ...remove];
      const placeholders = remove.map((_) => "?").join(",");
      q += `DELETE FROM highlight_tags WHERE highlight_id=$hid AND tag_id IN (${placeholders});`;
    }
    q += "COMMIT;";
    try {
      const res = await this.exec(q, "object", bindings);
      // const { result: { resultRows } } = res;
    } catch (e) {
      console.error(e);
      await this.exec("ROLLBACK;");
    }
    let bindings2: Record<string, any> = { $hid: hid };
    q = "BEGIN;";
    if (add.length > 0) {
      const key = (id: number) => `$${id}`;
      bindings2 = add.reduce((acc: Record<string, any>, tagId: number) => {
        acc[key(tagId)] = tagId;
        return acc;
      }, bindings2);
      const placeholders = add
        .map(key)
        .map((k) => `($hid,${k})`)
        .join(",");
      q += `INSERT INTO highlight_tags (highlight_id, tag_id) VALUES ${placeholders};`;
    }
    q += "COMMIT;";
    try {
      const res = await this.exec(q, "object", bindings2);
      // const { result: { resultRows } } = res;
    } catch (e) {
      console.error(e);
      await this.exec("ROLLBACK;");
    }
  }

  async updateTagPaths(updateEntries: Array<[number, string]>) {
    // updateEntries would look like
    // [[1, "newTagPathForTagWithId1"], [22, "newTagPathForTagWithId22"], ...]]
    let bindings: Record<string, any> = {};
    // for all entries add to binding $e0: tagId, $e1: tagPath
    bindings = updateEntries.reduce(
      (
        acc: Record<string, any>,
        [tagId, tagPath]: [number, string],
        i: number
      ) => {
        acc[`$e${i}id`] = tagId;
        acc[`$e${i}path`] = tagPath;
        return acc;
      },
      bindings
    );
    // console.log(bindings);
    let q = "BEGIN;";
    if (updateEntries.length > 0) {
      const placeholders = updateEntries
        .map(
          ([tagId, tagPath]: [number, string], i: number) =>
            `WHEN $e${i}id THEN $e${i}path`
        )
        .join(" ");
      q += `UPDATE tags SET path = CASE id ${placeholders} END WHERE id IN (${updateEntries
        .map(([tagId, tagPath]: [number, string], i: number) => `$e${i}id`)
        .join(",")});`;
    }
    q += "COMMIT;";
    // console.log(q);
    try {
      const res = await this.exec(q, "object", bindings);
      // const { result: { resultRows } } = res;
    } catch (e) {
      console.error(e);
      await this.exec("ROLLBACK;");
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
