import OpfsDb from "../../../OpfsDb";
import {} from "../../bind";

/*
	CREATE TABLE documents (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
	name VARCHAR(200) NOT NULL, 
	description TEXT NOT NULL, 
	filename VARCHAR(200) NOT NULL, 
	created DATETIME NOT NULL, 
	project_id INTEGER NOT NULL, 
	text_direction VARCHAR(13) NOT NULL, 
	contents TEXT NOT NULL, 
	CONSTRAINT fk_documents_project_id_projects FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE
)
    
	CREATE TABLE highlights (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
	document_id INTEGER NOT NULL, 
	start_offset INTEGER NOT NULL, 
	end_offset INTEGER NOT NULL, 
	snippet TEXT NOT NULL, 
	CONSTRAINT fk_highlights_document_id_documents FOREIGN KEY(document_id) REFERENCES documents (id) ON DELETE CASCADE
)
    	CREATE TABLE highlight_tags (
	highlight_id INTEGER NOT NULL, 
	tag_id INTEGER NOT NULL, 
	CONSTRAINT pk_highlight_tags PRIMARY KEY (highlight_id, tag_id), 
	CONSTRAINT fk_highlight_tags_highlight_id_highlights FOREIGN KEY(highlight_id) REFERENCES highlights (id) ON DELETE CASCADE, 
	CONSTRAINT fk_highlight_tags_tag_id_tags FOREIGN KEY(tag_id) REFERENCES tags (id) ON DELETE CASCADE
)
    CREATE TABLE tags (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
	project_id INTEGER NOT NULL, 
	path VARCHAR(200) NOT NULL, 
	description TEXT NOT NULL, 
	CONSTRAINT uq_tags_project_id UNIQUE (project_id, path), 
	CONSTRAINT fk_tags_project_id_projects FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE
)
example query for taggings:
  let q = `SELECT ht.tag_id as tid, ht.highlight_id as hid, d.id as did  FROM highlight_tags as ht INNER JOIN highlights as h ON ht.highlight_id = h.id INNER JOIN documents as d ON h.document_id = d.id`;
  q = `SELECT hid, did, path from (${q}) JOIN tags as t ON t.id = tid;`;
*/

export default async function readHighlightsIdsWhere(
  whereClause: string = "(1 = 1)",
  db: OpfsDb
): Promise<Taguette.DetailedHighlight[]> {
  // where clause might query based on docName, tagPath, tid, hid, did
  let q = `SELECT ht.tag_id as tid, ht.highlight_id as hid, h.snippet, d.id as did, d.name as docName FROM highlight_tags as ht INNER JOIN highlights as h ON ht.highlight_id = h.id INNER JOIN documents as d ON h.document_id = d.id`;
  q = `SELECT hid, snippet, did, tid, path as tagPath, docName from (${q}) JOIN tags as t ON t.id = tid`;
  q = `SELECT * FROM (${q}) WHERE ${whereClause}`;
  //{hid: 111, did: 15, tid: 628, tagPath: 'Work Allocation.outsourcing.expression.syntax', docName: 'Interview i13'}
  // now group concat the dids tids tagPaths and docNames for each hid
  q = `SELECT hid, snippet, did, docName, GROUP_CONCAT(tid) as tids, GROUP_CONCAT(tagPath) as tagPaths FROM (${q}) GROUP BY hid;`;
  //   {
  //     "hid": 86,
  //     "dids": "14,14,14",
  //     "tids": "690,622,693",
  //     "tagPaths": "Appraisals.responsibility.moderation,Work Allocation.outsourcing.over-reliance,Appraisals.responsibility.participation",
  //     "docNames": "Interview i12,Interview i12,Interview i12"
  // }
  // now make those real arrays
  const response = await db.transact(q, "object");
  let highlights = response?.result?.resultRows || [];
  highlights = highlights.map((highlight: any) => {
    highlight.tids = highlight.tids
      .split(",")
      .map((tid: string) => parseInt(tid, 10)) as number[];
    highlight.tagPaths = highlight.tagPaths.split(",") as string[];
    // assert that all arrays are the same length
    if (highlight.tids.length !== highlight.tagPaths.length) {
      throw new Error("Array lengths do not match");
    }
    const tags = highlight.tids.map((did: number, i: number) => ({
      id: highlight.tids[i],
      path: highlight.tagPaths[i],
    }));
    return {
      hid: highlight.hid,
      snippet: highlight.snippet,
      tags,
    };
  });
  return highlights as Taguette.DetailedHighlight[];
}
