import OpfsDb from "../../../OpfsDb";
import queries from "../../sql";
import { bindArray } from "../../bind";
type TaggingInfo = {
  path: string;
  tid: number;
  count: number;
};
export default async function readTaggingsByPath(paths: string[], db: OpfsDb) {
  // count the number of taggings that start with each path
  // select from highlight_tags where path like 'path%' but do that for all paths in the array
  //   const pathPatterns = paths.map((path) => `${path}%`);
  //   paths = paths.slice(0, 2);
  //   console.log("paths", paths);
  const pathBindings = paths.flatMap((path, i) => [path, `${path}%`]);
  //   console.log("pathBindings", pathBindings);
  let { bindings, placeholders } = bindArray(pathBindings);
  const placeholdersArray = placeholders.split(",");
  const selects = paths.map(
    (_, index) =>
      `SELECT id, path as child, ${
        placeholdersArray[index * 2]
      } as parent FROM tags WHERE path LIKE ${placeholdersArray[index * 2 + 1]}`
    // `SELECT id, path as child, 'evaluating' as parent FROM tags WHERE path LIKE 'evaluating%'`
  );
  const unionTable = `(${selects.join(" UNION ")})`;
  //   const q = `SELECT * from ${unionTable};`;
  const taggingsTable = `SELECT highlight_id as hid, parent, COUNT(parent) as duplicates FROM ${unionTable} AS tags LEFT JOIN highlight_tags AS hlt ON tags.id = hlt.tag_id GROUP BY parent, highlight_id`;
  const q = `SELECT COUNT(hid) as highlights, parent as parentPath FROM (${taggingsTable}) GROUP BY parent;`;

  //   const qA = `SELECT id, path as child, 'evaluating' as parent FROM tags WHERE path LIKE 'evaluating%'`;
  //   const qB = `SELECT id, path as child, 'dissonance' as parent FROM tags WHERE path LIKE 'dissonance%'`;
  //   let q = `SELECT highlight_id as hid, parent, COUNT(parent) as duplicates FROM (${qA} UNION ${qB}) AS tags LEFT JOIN highlight_tags AS hlt ON tags.id = hlt.tag_id GROUP BY parent, highlight_id`;
  //   q = `SELECT COUNT(hid) as hlCount, parent FROM (${q}) GROUP BY parent;`;
  //   console.log(q);
  //   const response = await db.transact(q2, "object", bindings);
  const response = await db.transact(q, "object", bindings);
  //   return

  const taggings = response?.result?.resultRows || [];
  return taggings as Taguette.ParentTaggingCount[];
}
// CREATE TABLE highlight_tags (
// 	highlight_id INTEGER NOT NULL,
// 	tag_id INTEGER NOT NULL,
// 	CONSTRAINT pk_highlight_tags PRIMARY KEY (highlight_id, tag_id),
// 	CONSTRAINT fk_highlight_tags_highlight_id_highlights FOREIGN KEY(highlight_id) REFERENCES highlights (id) ON DELETE CASCADE,
// 	CONSTRAINT fk_highlight_tags_tag_id_tags FOREIGN KEY(tag_id) REFERENCES tags (id) ON DELETE CASCADE
// )
