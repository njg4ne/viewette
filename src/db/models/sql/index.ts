// import highlightsWithTags from "./highlightsWithTags";
import highlightsWithTags from "./highlightsWithTags.sql?raw";
import readTags from "./readTags.sql?raw";
import validateCollection from "./validateCollection.sql?raw";
export const queries = {
  highlightsWithTags,
  readTags,
  validateCollection,
};
export default queries;

// #qTaggings: string = `SELECT highlights.id as hid, highlight_tags.tag_id as tid FROM highlights JOIN highlight_tags ON highlights.id = highlight_tags.highlight_id;`;
// #qTagLookup: string = `SELECT DISTINCT tags.id as tid, tags.path as tag FROM highlights JOIN highlight_tags ON highlights.id = highlight_tags.highlight_id JOIN tags ON highlight_tags.tag_id = tags.id;`;
// #qHighlightsLookup: string = "SELECT id, snippet FROM highlights;";
// #qHighlightById: string = "SELECT snippet FROM highlights WHERE id = ?;";
