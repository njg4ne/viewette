import OpfsDb from "../../../OpfsDb";
import queries from "../../sql";
import { bindArray } from "../../bind";

export default async function readTaggings(
  db: OpfsDb
): Promise<Taguette.Tagging[]> {
  let q = `SELECT ht.tag_id as tid, ht.highlight_id as hid, d.id as did  FROM highlight_tags as ht INNER JOIN highlights as h ON ht.highlight_id = h.id INNER JOIN documents as d ON h.document_id = d.id`;
  q = `SELECT hid, did, path from (${q}) JOIN tags as t ON t.id = tid;`;
  const response = await db.transact(q, "object");
  const taggings = response?.result?.resultRows || [];
  return taggings as Taguette.Tagging[];
}

export async function readTaggingsByContrast(
  db: OpfsDb,
  whereClause: string = "(1 = 1)"
): Promise<[Taguette.Tagging[], Taguette.Tagging[]]> {
  // get first all the hlIds that match the where clause
  let q = `SELECT DISTINCT highlight_id FROM highlight_tags INNER JOIN tags ON highlight_tags.tag_id = tags.id WHERE ${whereClause}`;
  function qFor(contrast: boolean, hlQ: string) {
    const maybeNot = contrast ? "" : "NOT";
    return `SELECT ht.tag_id as tid, ht.highlight_id as hid, d.id as did  FROM highlight_tags as ht INNER JOIN highlights as h ON ht.highlight_id = h.id INNER JOIN documents as d ON h.document_id = d.id WHERE h.id ${maybeNot} IN (${hlQ})`;
  }
  let qTrue = qFor(true, q);
  let qFalse = qFor(false, q);
  const nextQ = (prevQ: string) =>
    `SELECT hid, did, path from (${prevQ}) JOIN tags as t ON t.id = tid;`;
  qTrue = nextQ(qTrue);
  qFalse = nextQ(qFalse);

  const responses = await Promise.all(
    [qTrue, qFalse].map((q) => db.transact(q, "object"))
  );
  const taggings = responses.map(
    (response) => response?.result?.resultRows || []
  );
  function onlyPredictingTags(tagging: Taguette.Tagging) {
    return tagging.path.includes("predicting");
  }
  // console.log(
  //   "DEBUG T:",
  //   ...taggings[0].filter(onlyPredictingTags),
  //   "DEBUG F:",
  //   ...taggings[1].filter(onlyPredictingTags)
  // );
  return taggings as [Taguette.Tagging[], Taguette.Tagging[]];
}
