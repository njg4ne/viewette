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
}
