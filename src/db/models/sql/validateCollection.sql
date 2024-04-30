SELECT existence
FROM (
        SELECT `name` as collection,
            COUNT(name) as existence
        FROM `sqlite_master`
        WHERE type = 'table'
            AND name = $collection
    );