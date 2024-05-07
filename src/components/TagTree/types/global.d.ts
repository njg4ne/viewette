namespace Tag {
  type Entry = [string, string];
}
namespace Taguette {
  type Highlight = {
    id: number;
    snippet: string;
    tags: string[];
    tagIds: number[];
  };
  type Tag = {
    id: number;
    project_id: number;
    path: string;
    description: string;
  };
  type ParentTaggingCount = {
    highlights: number;
    parentPath: string;
  };
}
