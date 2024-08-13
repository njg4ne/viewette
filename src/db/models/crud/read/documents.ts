import OpfsDb from "../../../OpfsDb";

// CREATE TABLE documents (
// 	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
// 	name VARCHAR(200) NOT NULL,
// 	description TEXT NOT NULL,
// 	filename VARCHAR(200) NOT NULL,
// 	created DATETIME NOT NULL,
// 	project_id INTEGER NOT NULL,
// 	text_direction VARCHAR(13) NOT NULL,
// 	contents TEXT NOT NULL,
// 	CONSTRAINT fk_documents_project_id_projects FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE
// )

export default async function readDocuments(
  db: OpfsDb
): Promise<Partial<Taguette.Document>[]> {
  const q = `SELECT id, name FROM documents;`;
  const response = await db.transact(q, "object");
  let documents = response?.result?.resultRows || [];
  return documents as { id: number; name: string }[];
}
