import TaguetteDb from "../../../TaguetteDb";
import { bindObject } from "../../../bind";
export default async function byId(
  updateEntries: Array<[number, string]>,
  //   exec: SQLite3.Delegate.Executor
  db: TaguetteDb
) {
  let bindings: Record<string, any> = {};
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
  const placeholders = updateEntries
    .map(
      ([tagId, tagPath]: [number, string], i: number) =>
        `WHEN $e${i}id THEN $e${i}path`
    )
    .join(" ");
  const q = `UPDATE tags SET path = CASE id ${placeholders} END WHERE id IN (${updateEntries
    .map(([tagId, tagPath]: [number, string], i: number) => `$e${i}id`)
    .join(",")});`;
  let rowMode = "object" as const;
  console.log(q);
  const _response = await db.transact(q, rowMode, bindings);
  const changes = await db.exec("SELECT changes() as changes");
  const numRenamed = (changes?.result?.resultRows?.at(0) as number) | 0;
  return numRenamed;
}
