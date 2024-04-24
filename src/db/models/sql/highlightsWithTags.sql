SELECT highlights.id,
    highlights.snippet,
    GROUP_CONCAT(tags.path) AS tags,
    GROUP_CONCAT(tags.id) AS tagIds
FROM highlights
    LEFT JOIN highlight_tags ON highlights.id = highlight_tags.highlight_id
    LEFT JOIN tags ON highlight_tags.tag_id = tags.id
GROUP BY highlights.id;