import OpfsDb from "../../../OpfsDb";
import queries from "../../sql";
import { bindObject } from "../../bind";

export default async function readTagById($tagId: number, db: OpfsDb) {
  var bindings = { $tagId } as Record<string, string | number>;
  var { bindings, placeholders } = bindObject(bindings);
  const q = `SELECT * FROM tags WHERE id = $tagId;`;
  const rowMode = "object" as const;
  const response = await db.transact(q, rowMode, bindings);
  const {
    result: { resultRows },
  } = response;
  return resultRows?.at(0) as Taguette.Tag;
}
