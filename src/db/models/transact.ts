import OpfsDb from "../OpfsDb";

export default async function transact(
  sql: string,
  rowMode: "array" | "object" | undefined,
  bindings: Record<string, any> | undefined,
  db: OpfsDb
) {
  const q = `BEGIN;${sql}COMMIT;`;
  try {
    const res = await db.exec(q, "object", bindings);
    return Promise.resolve(res);
  } catch (e) {
    // return Promise.reject(e);
    await db.exec("ROLLBACK;");
    return Promise.reject(e);
  }
}
