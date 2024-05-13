import { OpfsDb } from "../";
import queries from "./sql";
// import transactFunc from "./transact";
import deletion from "./crud/delete";
import updateTagsPaths from "./crud/update/tags/byId";
import updateTag from "./crud/update/tag";
import readTags from "./crud/read/tags";
import readTaggingsByPath from "./crud/read/taggingsByPath";
import readTagById from "./crud/read/tagById";
// make a class that extends opfsdb called TaguetteDb that has methods for each of the taguette queries
export default class TaguetteDb extends OpfsDb {
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
  async getHighlights(): Promise<Taguette.Highlight[]> {
    const t0 = performance.now();

    const {
      result: { resultRows },
      workerReceivedTime: t1,
      workerRespondTime: t2,
    } = await this.exec(queries.highlightsWithTags, "object");
    const t3 = performance.now();
    return resultRows?.map(this.#highlightRowConverter) ?? [];
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
      const message = (e as SQLite3.Worker1.Error)?.result?.message ?? "?:";
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
  // async deleteTag($tid: number) {
  //   const bindings = { $tid };
  //   try {
  //     const { result } = await this.exec(
  //       `DELETE FROM tags WHERE id = $tid;`,
  //       "object",
  //       bindings
  //     );
  //     return Promise.resolve($tid);
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }
  async deleteTag($path: number) {
    const bindings = { $path: $path + "%" };
    const q = `
      DELETE FROM tags
        WHERE path LIKE $path
        RETURNING id, path
      ;`;
    try {
      const response = await this.exec(q, "object", bindings);
      return Promise.resolve(response?.result?.resultRows);
    } catch (e) {
      Promise.reject(e);
    }
  }

  async getTags() {
    const {
      result: { resultRows },
    } = await this.exec(`SELECT tags.id as tagId, tags.path as tag FROM tags;`);
    return resultRows?.reduce(
      (acc: Record<number, string>, [tagId, tag]: [number, string]) => {
        acc[tagId] = tag;
        return acc;
      },
      {}
    );
  }
  read = {
    tag: {
      byId: async (tagId: number) => readTagById(tagId, this),
    },
    tags: async () => await readTags(this),
    taggingsByPath: async (paths: string[]) =>
      await readTaggingsByPath(paths, this),
  };
  delete = {
    tags: {
      byExactPaths: async (paths: string[]) =>
        await deletion.tags.byExactPaths(paths, this),
    },
  };
  update = {
    tag: async (tag: Taguette.Tag) => await updateTag(tag, this),
    tags: {
      byId: (updateEntries: Array<[number, string]>) =>
        // updateTagPaths(updateEntries, this.exec),
        updateTagsPaths(updateEntries, this),
      forHighlight: (hid: number, remove: number[], add: number[]) =>
        updateTagsForHighlight(hid, remove, add, this),
    },
  };
}
// function deleteTagPathsExactly(
//   paths: string[],
//   exec: SQLite3.Delegate.Executor
// ) {}

// async function updateTagPaths(
//   updateEntries: Array<[number, string]>,
//   exec: SQLite3.Delegate.Executor
// ) {
//   // updateEntries would look like
//   // [[1, "newTagPathForTagWithId1"], [22, "newTagPathForTagWithId22"], ...]]
//   let bindings: Record<string, any> = {};
//   // for all entries add to binding $e0: tagId, $e1: tagPath
//   bindings = updateEntries.reduce(
//     (
//       acc: Record<string, any>,
//       [tagId, tagPath]: [number, string],
//       i: number
//     ) => {
//       acc[`$e${i}id`] = tagId;
//       acc[`$e${i}path`] = tagPath;
//       return acc;
//     },
//     bindings
//   );
//   // console.log(bindings);
//   let q = "BEGIN;";
//   if (updateEntries.length > 0) {
//     const placeholders = updateEntries
//       .map(
//         ([tagId, tagPath]: [number, string], i: number) =>
//           `WHEN $e${i}id THEN $e${i}path`
//       )
//       .join(" ");
//     q += `UPDATE tags SET path = CASE id ${placeholders} END WHERE id IN (${updateEntries
//       .map(([tagId, tagPath]: [number, string], i: number) => `$e${i}id`)
//       .join(",")});`;
//   }
//   q += "COMMIT;";
//   // console.log(q);
//   try {
//     const res = await exec(q, "object", bindings);
//     // const { result: { resultRows } } = res;
//   } catch (e) {
//     console.error(e);
//     await exec("ROLLBACK;");
//   }
// }
async function updateTagsForHighlight(
  hid: number,
  remove: number[],
  add: number[],
  db: TaguetteDb
  // exec: SQLite3.Delegate.Executor
) {
  // var bindings: Array<any> = [hid];
  var bindings: Record<string, any> = { $hid: hid };
  let sql = "";
  // console.log(remove, add);
  if (remove.length > 0) {
    // bindings = [...bindings, ...remove];
    const key = (id: number) => `$deleteTag${id}`;
    remove.forEach((tagId) => {
      bindings[key(tagId)] = tagId;
    });
    // const placeholders = remove.map((_) => "?").join(",");
    const placeholders = remove.map((tagId) => key(tagId)).join(",");
    sql += `DELETE FROM highlight_tags WHERE highlight_id=$hid AND tag_id IN (${placeholders});`;
  }
  const transactions = [];
  transactions.push({ sql, bindings });
  bindings = { $hid: hid };
  sql = "";
  if (add.length > 0) {
    const key = (id: number) => `$addTag${id}`;
    bindings = add.reduce((acc: Record<string, any>, tagId: number) => {
      acc[key(tagId)] = tagId;
      return acc;
    }, bindings);
    const placeholders = add
      .map(key)
      .map((k) => `($hid,${k})`)
      .join(",");
    sql += `INSERT INTO highlight_tags (highlight_id, tag_id) VALUES ${placeholders};`;
  }
  transactions.push({ sql, bindings });
  await db.transactAll(transactions);
  const changePromise = db.exec("SELECT changes() as changes");
  const getNumChanges: (response: any) => any = ({
    result: {
      resultRows: [first],
    },
  }) => first;
  return null;
}
async function _updateTagsForHighlight(
  hid: number,
  remove: number[],
  add: number[],
  db: TaguetteDb
  // exec: SQLite3.Delegate.Executor
) {
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
    const res = await db.exec(q, "object", bindings);
    // const { result: { resultRows } } = res;
  } catch (e) {
    console.error(e);
    await db.exec("ROLLBACK;");
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
    const res = await db.exec(q, "object", bindings2);
    // const { result: { resultRows } } = res;
  } catch (e) {
    console.error(e);
    await db.exec("ROLLBACK;");
  }
}

// function generateDatabase() {
//   const dbName = "database";
//   // const fileName = `${dbName}.sqlite3`;
//   // async function files() {
//   //   const files = [];
//   //   const opfsRoot = await navigator.storage.getDirectory();
//   //   //@ts-expect-error
//   //   for await (const entry of opfsRoot.values()) {
//   //     files.push(entry.name);
//   //   }
//   //   return files;
//   // }
//   // const filesList = await files();
//   // if (!filesList.includes(fileName)) {
//   //   return null;
//   // }
//   const db = new TaguetteDb(dbName);
//   // const openTask: Promise<SQLite3.Worker1.Response> = db.open(dbName);
//   return db;
// }
// const db = new TaguetteDb("database");
// export { db };
