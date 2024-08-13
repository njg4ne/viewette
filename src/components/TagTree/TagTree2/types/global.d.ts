// namespace Tag {
//   type Entry = [string, string];
// }
namespace Viewette {
  namespace TagTree {
    interface Item {
      path: string;
      children?: Item[];
    }
  }
  namespace SlowTagTree {
    interface Item {
      path: string;
      familyTags: Taguette.Tag[];
      level: number;
      label: string;
      isTag: boolean;
      hlCount: number;
      docCount: number;
      tag?: Taguette.Tag;
    }
  }
}
