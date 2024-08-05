DROP TABLE IF EXISTS tags;

CREATE TABLE tags (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
	project_id INTEGER NOT NULL, 
	path VARCHAR(200) NOT NULL, 
	description TEXT NOT NULL, 
	CONSTRAINT uq_tags_project_id UNIQUE (project_id, path), 
	CONSTRAINT fk_tags_project_id_projects FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE
);

INSERT INTO tags (id, project_id, path, description)
VALUES
	(1, 1, 'acceleration', 'Some description for acceleration'),
	(2, 1, 'exploration', 'Some description for exploration');
