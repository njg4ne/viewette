-- Drop the table if it exists
DROP TABLE IF EXISTS actions;

-- Create the 'actions' table
CREATE TABLE IF NOT EXISTS actions (
    id INTEGER NOT NULL PRIMARY KEY, 
    done DATETIME NOT NULL UNIQUE
);

-- Drop the table if it exists
DROP TABLE IF EXISTS history;

-- Create the 'history' table
CREATE TABLE IF NOT EXISTS history (
    id INTEGER NOT NULL PRIMARY KEY,
    action_id INTEGER NOT NULL,
    [table] TEXT NOT NULL,
    column TEXT NOT NULL,
    previous TEXT NOT NULL,
    CONSTRAINT fk_history_action_id_actions FOREIGN KEY (action_id) REFERENCES actions (id) ON DELETE CASCADE
);

DROP TRIGGER IF EXISTS undoable_tag_update;
-- Create the trigger if it does not exist
CREATE TRIGGER undoable_tag_update
AFTER UPDATE OF path, description ON tags
BEGIN
    INSERT INTO actions (done) VALUES (datetime('now'));
    INSERT INTO history (action_id, [table], column, previous) 
    VALUES (
        (SELECT id FROM actions ORDER BY done DESC LIMIT 1),
        'tags', 
        CASE 
            WHEN NEW.path != OLD.path THEN 'path'
            WHEN NEW.description != OLD.description THEN 'description'
        END,
        CASE 
            WHEN NEW.path != OLD.path THEN OLD.path
            WHEN NEW.description != OLD.description THEN OLD.description
        END
    );
END;

DROP TRIGGER IF EXISTS undoable_tag_actions;
-- -- Create the trigger if it does not exist
-- CREATE TRIGGER undoable_tag_actions
-- BEFORE UPDATE OF path, description ON tags
-- BEGIN
--     INSERT INTO actions (done) VALUES (datetime('now'));
-- END;

DROP TRIGGER IF EXISTS undoable_tag_path_update;
-- -- Create the trigger if it does not exist
-- CREATE TRIGGER undoable_tag_path_update
-- AFTER UPDATE OF path ON tags
-- BEGIN
--     -- INSERT INTO actions (done) VALUES (datetime('now'));
--     INSERT INTO history (action_id, [table], column, previous) VALUES ((SELECT id FROM actions ORDER BY done DESC LIMIT 1),'tags', 'path', old.path);
-- END;

DROP TRIGGER IF EXISTS undoable_tag_description_update;
-- -- Create the trigger if it does not exist
-- CREATE TRIGGER undoable_tag_description_update
-- AFTER UPDATE OF description ON tags
-- BEGIN
--     -- INSERT INTO actions (done) VALUES (datetime('now'));
--     INSERT INTO history (action_id, [table], column, previous) VALUES ((SELECT id FROM actions ORDER BY done DESC LIMIT 1), 'tags', 'description', old.description);
-- END;


-- SELECT * FROM sqlite_master WHERE type = 'trigger';

SELECT [path], [description] FROM tags WHERE [path] = 'exploration';

UPDATE tags SET [path] = 'exploring', [description] = 'Exploring the world' WHERE [path] = 'exploration';
SELECT * FROM actions ORDER BY done DESC;

UPDATE tags SET [path] = 'exploration', [description] = 'Exploration of the world' WHERE [path] = 'exploring';
SELECT * FROM actions ORDER BY done DESC;

SELECT [path], [description] FROM tags WHERE [path] = 'exploration';

SELECT * FROM actions;
SELECT * FROM history;