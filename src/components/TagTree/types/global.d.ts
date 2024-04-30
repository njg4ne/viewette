namespace Tag {
  type Entry = [string, string];
}
namespace Taguette {
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
