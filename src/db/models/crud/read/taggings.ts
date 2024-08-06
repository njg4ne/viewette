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
  whereClause: string = "WHERE contrastTag like '%predicting%'"
): Promise<[Taguette.Tagging[], Taguette.Tagging[]]> {
  // get first all the hlIds that match the where clause
  const hlQ = `SELECT id FROM highlights ${whereClause}`;
  const antiHlQ = `SELECT id FROM highlights WHERE NOT(${whereClause})`;
  const qAFor = (idSetQ: string) =>
    `SELECT ht.tag_id as tid, ht.highlight_id as hid, d.id as did  FROM highlight_tags as ht INNER JOIN highlights as h ON ht.highlight_id = h.id INNER JOIN documents as d ON h.document_id = d.id WHERE h.id IN (${idSetQ})`;
  const qBFor = (idSetQ: string) =>
    `SELECT hid, did, path from (${qAFor(
      idSetQ
    )}) JOIN tags as t ON t.id = tid;`;
  const qTrue = qBFor(hlQ);
  const qFalse = qBFor(antiHlQ);
  const responses = await Promise.all(
    [qTrue, qFalse].map((q) => db.transact(q, "object"))
  );
  const taggings = responses.map(
    (response) => response?.result?.resultRows || []
  );
  return taggings as [Taguette.Tagging[], Taguette.Tagging[]];
}
