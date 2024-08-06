import OpfsDb from "../../../OpfsDb";
import queries from "../../sql";
import { bindArray } from "../../bind";
import readTaggings, { readTaggingsByContrast } from "./taggings";
import { getTagParts, SEPARATOR } from "../../../../components/TagTree/utils";
// export default async function readTaggingsByPath(paths: string[], db: OpfsDb) {
//   const briefTaggings = await readTaggings(db);
//   console.log(briefTaggings);
//   getBranches(paths, 0, briefTaggings);

//   console.log(briefTaggings);
//   const taggings = paths.map(
//     (path) =>
//       ({
//         highlights: 0,
//         parentPath: path,
//         hlCount: 0,
//         docCount: 0,
//       } as Taguette.TaggingSummary)
//   );
//   return taggings as Taguette.TaggingSummary[];
// }

// function getBranches(
//   tagPaths: string[],
//   level: number,
//   taggings: Taguette.TaggingSummary[],
//   prefix: string = ""
// ): any[] {
//   if (tagPaths.length === 0) {
//     return [];
//   }
//   //   @ts-ignore
//   const groups = Object.groupBy(tagPaths, (tagPath: string) =>
//     getTagParts(tagPath).at(level)
//   );
//   type Entry = [string, string[] | undefined];
//   const entries = Object.entries(groups) as Entry[];
//   return entries.map(([label, familyTags]) => {
//     familyTags = familyTags || [];
//     const path = prefix + label;
//     const parent = familyTags.find((tagPath) => tagPath === path);
//     const childTags = familyTags.filter((tagPath) => tagPath !== path);
//     const children = getBranches(
//       childTags,
//       level + 1,
//       taggings,
//       path + SEPARATOR
//     );
//     const tagging = taggings.find((tagging) => tagging.parentPath === path);
//     let hlCount = tagging?.hlCount || 0;
//     hlCount = children.reduce((acc, child) => acc + child.hlCount, hlCount);
//     let docCount = tagging?.docCount || 0;
//     docCount = children.reduce((acc, child) => acc + child.docCount, docCount);
//     const data: Taguette.TaggingSummary = {
//       highlights: 0,
//       parentPath: path,
//       hlCount,
//       docCount,
//     };
//     tagging ? Object.assign(tagging, data) : taggings.push(data);
//     return {
//       // label,
//       // path,
//       // level,
//       // children,
//       hlCount,
//       docCount,
//     } as any;
//   });
// }

export async function readTaggingsByPathWithContrast(
  paths: string[],
  db: OpfsDb,
  whereClause: string = "WHERE 1 = 1"
) {
  const [trueTaggings, falseTaggings] = await readTaggingsByContrast(
    db,
    whereClause
  );
  return [trueTaggings, falseTaggings].map((taggings) =>
    paths.map((path) => collectSummary(taggings, path))
  );
}

export default async function readTaggingsByPath(paths: string[], db: OpfsDb) {
  const taggings = await readTaggings(db);
  return paths.map((path) => collectSummary(taggings, path));
  // return paths.map((path) => {
  //   const containedTaggings = taggings.filter((tagging) =>
  //     tagging.path.startsWith(path)
  //   );
  //   const hlCount = new Set(
  //     containedTaggings.map(({ hid }: Taguette.Tagging) => hid)
  //   ).size;
  //   const docCount = new Set(
  //     containedTaggings.map(({ did }: Taguette.Tagging) => did)
  //   ).size;
  //   return {
  //     // highlights: hlCount,
  //     parentPath: path,
  //     hlCount,
  //     docCount,
  //   } as Taguette.TaggingSummary;
  // });
}

function collectSummary(taggings: Taguette.Tagging[], path: string) {
  const containedTaggings = taggings.filter((tagging) =>
    tagging.path.startsWith(path)
  );
  const hlCount = new Set(
    containedTaggings.map(({ hid }: Taguette.Tagging) => hid)
  ).size;
  const docCount = new Set(
    containedTaggings.map(({ did }: Taguette.Tagging) => did)
  ).size;
  return {
    // highlights: hlCount,
    parentPath: path,
    hlCount,
    docCount,
  } as Taguette.TaggingSummary;
}

async function readTaggingsByPath0(paths: string[], db: OpfsDb) {
  const pathBindings = paths.flatMap((path, i) => [path, `${path}%`]);
  let { bindings, placeholders } = bindArray(pathBindings);
  const placeholdersArray = placeholders.split(",");
  const selects = paths.map(
    (_, index) =>
      `SELECT id, path as child, ${
        placeholdersArray[index * 2]
      } as parent FROM tags WHERE path LIKE ${placeholdersArray[index * 2 + 1]}`
  );
  const unionTable = `(${selects.join(" UNION ")})`;
  const taggingsTable = `SELECT highlight_id as hid, parent, COUNT(parent) as duplicates FROM ${unionTable} AS tags LEFT JOIN highlight_tags AS hlt ON tags.id = hlt.tag_id GROUP BY parent, highlight_id`;
  const q = `SELECT COUNT(hid) as highlights, parent as parentPath FROM (${taggingsTable}) GROUP BY parent;`;
  const response = await db.transact(q, "object", bindings);
  const taggings = response?.result?.resultRows || [];
  await readTaggings(db);
  return taggings as Taguette.TaggingSummary[];
}
// CREATE TABLE highlight_tags (
// 	highlight_id INTEGER NOT NULL,
// 	tag_id INTEGER NOT NULL,
// 	CONSTRAINT pk_highlight_tags PRIMARY KEY (highlight_id, tag_id),
// 	CONSTRAINT fk_highlight_tags_highlight_id_highlights FOREIGN KEY(highlight_id) REFERENCES highlights (id) ON DELETE CASCADE,
// 	CONSTRAINT fk_highlight_tags_tag_id_tags FOREIGN KEY(tag_id) REFERENCES tags (id) ON DELETE CASCADE
// )
