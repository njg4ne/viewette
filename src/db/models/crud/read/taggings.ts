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
