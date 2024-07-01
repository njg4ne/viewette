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
}
