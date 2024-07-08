CREATE TABLE users (
	login VARCHAR(30) NOT NULL, 
	created DATETIME NOT NULL, 
	hashed_password VARCHAR(192), 
	disabled BOOLEAN NOT NULL, 
	password_set_date DATETIME, 
	language VARCHAR(10), 
	email VARCHAR(256), 
	email_sent DATETIME, 
	CONSTRAINT pk_users PRIMARY KEY (login)
);	
CREATE TABLE projects (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
	name VARCHAR(200) NOT NULL, 
	description TEXT NOT NULL, 
	created DATETIME NOT NULL
);
CREATE TABLE project_members (
	project_id INTEGER NOT NULL, 
	user_login VARCHAR(30) NOT NULL, 
	privileges VARCHAR(11) NOT NULL, 
	CONSTRAINT pk_project_members PRIMARY KEY (project_id, user_login), 
	CONSTRAINT fk_project_members_project_id_projects FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE, 
	CONSTRAINT fk_project_members_user_login_users FOREIGN KEY(user_login) REFERENCES users (login) ON DELETE CASCADE ON UPDATE CASCADE
);
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
);
CREATE TABLE commands (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
	date DATETIME NOT NULL, 
	user_login VARCHAR(30) NOT NULL, 
	project_id INTEGER NOT NULL, 
	document_id INTEGER, 
	payload TEXT NOT NULL, 
	CONSTRAINT fk_commands_user_login_users FOREIGN KEY(user_login) REFERENCES users (login) ON UPDATE CASCADE, 
	CONSTRAINT fk_commands_project_id_projects FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE
);
CREATE TABLE tags (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
	project_id INTEGER NOT NULL, 
	path VARCHAR(200) NOT NULL, 
	description TEXT NOT NULL, 
	CONSTRAINT uq_tags_project_id UNIQUE (project_id, path), 
	CONSTRAINT fk_tags_project_id_projects FOREIGN KEY(project_id) REFERENCES projects (id) ON DELETE CASCADE
);
CREATE TABLE highlights (
	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
	document_id INTEGER NOT NULL, 
	start_offset INTEGER NOT NULL, 
	end_offset INTEGER NOT NULL, 
	snippet TEXT NOT NULL, 
	CONSTRAINT fk_highlights_document_id_documents FOREIGN KEY(document_id) REFERENCES documents (id) ON DELETE CASCADE
);
 CREATE TABLE highlight_tags (
	highlight_id INTEGER NOT NULL, 
	tag_id INTEGER NOT NULL, 
	CONSTRAINT pk_highlight_tags PRIMARY KEY (highlight_id, tag_id), 
	CONSTRAINT fk_highlight_tags_highlight_id_highlights FOREIGN KEY(highlight_id) REFERENCES highlights (id) ON DELETE CASCADE, 
	CONSTRAINT fk_highlight_tags_tag_id_tags FOREIGN KEY(tag_id) REFERENCES tags (id) ON DELETE CASCADE
);
CREATE TABLE alembic_version (
	version_num VARCHAR(32) NOT NULL, 
	CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

INSERT INTO projects (name, description, created) VALUES ('Default', 'Default project', datetime('now'));   
INSERT INTO documents (name, description, filename, created, project_id, text_direction, contents) VALUES ('Email from Jane Doe', 'Default document', 'default.md', datetime('now'), 1, 'ltr', '');
INSERT INTO highlights (document_id, start_offset, end_offset, snippet) VALUES ((SELECT id FROM documents WHERE name = 'Email from Jane Doe'), 0, 0, 'Apples are my favorite fruit, but broccoli is my favorite vegetable.');
INSERT INTO highlights (document_id, start_offset, end_offset, snippet) VALUES ((SELECT id FROM documents WHERE name = 'Email from Jane Doe'), 0, 0, 'Pineapples are scary, so I dream about them often.');
INSERT INTO tags (project_id, path, description) VALUES (1, 'fruit', 'Fruit-related tags');
INSERT INTO tags (project_id, path, description) VALUES (1, 'vegetable', 'Vegetable-related tags');
INSERT INTO tags (project_id, path, description) VALUES (1, 'scary', 'Scary-related tags');
INSERT INTO tags (project_id, path, description) VALUES (1, 'fruit.tropical', 'Tropical fruit-related tags');
INSERT INTO tags (project_id, path, description) VALUES (1, 'vegetable.cruciferous', 'Cruciferous vegetable-related tags');
INSERT INTO highlight_tags (highlight_id, tag_id) VALUES ((SELECT id FROM highlights WHERE snippet = 'Apples are my favorite fruit, but broccoli is my favorite vegetable.'), (SELECT id FROM tags WHERE path = 'fruit'));
INSERT INTO highlight_tags (highlight_id, tag_id) VALUES ((SELECT id FROM highlights WHERE snippet = 'Apples are my favorite fruit, but broccoli is my favorite vegetable.'), (SELECT id FROM tags WHERE path = 'vegetable'));
INSERT INTO highlight_tags (highlight_id, tag_id) VALUES ((SELECT id FROM highlights WHERE snippet = 'Pineapples are scary, so I dream about them often.'), (SELECT id FROM tags WHERE path = 'scary'));
