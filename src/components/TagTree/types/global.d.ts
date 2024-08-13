namespace Tag {
  type Entry = [string, string];
}
namespace Taguette {
  type Highlight = {
    id: number;
    snippet: string;
    tags: string[];
    tagIds: number[];
    source: string;
  };
  type DetailedHighlight = {
    hid: number;
    snippet: string;
    tags: {
      id: number;
      path: string;
    }[];
  };
  type Tag = {
    id: number;
    project_id: number;
    path: string;
    description: string;
  };
  type Tagging = {
    path: string;
    hid: number;
    did: number;
  };
  type TaggingSummary = {
    parentPath: string;
    hlCount: number;
    docCount: number;
  };
  type Document = {
    id: number;
    name: string;
    description: string;
    filename: string;
    created: Date;
    project_id: number;
    text_direction: string;
    contents: string;
  };
}
