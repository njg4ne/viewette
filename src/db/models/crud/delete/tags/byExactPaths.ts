import TaguetteDb from "../../../TaguetteDb";
import { bindObject } from "../../../bind";
export default async function deleteTagsByExactPaths(
  paths: string[],
  db: TaguetteDb
): Promise<number> {
  // await db.exec("PRAGMA foreign_keys = ON;");
  var bindings = paths.reduce((acc, path, index) => {
    const key = `$pathBinding${index}`;
    acc[key] = path;
    return acc;
  }, {} as Record<string, string | number>);
  var placeholders: string;
  var { bindings, placeholders } = bindObject(bindings);
  //   const q = `DELETE FROM tags WHERE path IN (${placeholders});`;
  // do like above but return select count from rows deleted
  const q = `DELETE FROM tags WHERE path IN (${placeholders});`;
  let rowMode = "object" as const;
  const _response = await db.transact(q, rowMode, bindings);
  const changes = await db.exec("SELECT changes() as changes");
  const numDeleted = (changes?.result?.resultRows?.at(0) as number) | 0;
  return numDeleted;
}
