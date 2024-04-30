import OpfsDb from "../../../OpfsDb";
import queries from "../../sql";
export default async function readTags(db: OpfsDb) {
  const response = await db.transact(queries.readTags);
  const {
    result: { resultRows: tags },
  } = response;
  return (tags || []) as Taguette.Tag[];
}
