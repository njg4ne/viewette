// import type { TagTreeItem } from "../components/TagTree/TagTreeItems/MultipleTagTreeItems";
import {
  getTagParts,
  pathUpToLevel,
  SEPARATOR,
} from "../components/TagTree/utils";
type TagTreeItem = {
  path: string;
  level: number;
  label: string;
  isTag: () => boolean;
  children: Map<string, TagTreeItem>;
  selected: boolean;
  expanded: boolean;
};
export default function buildTree(tags: Taguette.Tag[]) {
  let start = performance.now();
  tags.sort(compareTags);
  console.log("sort took", performance.now() - start);

  const level = 0;
  //   for (let { path } of tags) {
  //     console.log(path);
  //   }
  const m = imperativeTreeBuilder(tags);
  console.log("imperativeTreeBuilder", performance.now() - start);
  //   start = performance.now();
  //   const branches = getBranches(tags, level);
  //   console.log("buildTree took", performance.now() - start);
  //   console.log(branches);
}

function imperativeTreeBuilder(tags: Taguette.Tag[]) {
  const tree = new Map<string, any>();

  for (const tag of tags) {
    let currentBranch = tree;
    const parts = getTagParts(tag.path);
    console.log(parts);
    while (parts.length > 0) {
      const part = parts.shift() as string;
      console.log(part);
      //   if (parts.length === 0) {
      //     tree.set(part, tag);
      //   } else {
      //     if (!currentBranch.has(part)) {
      //       currentBranch.set(part, new Map<string, any>());
      //     }
      //     currentBranch = currentBranch.get(part);
      //   }
    }
  }
}

function getBranches(
  tags: Taguette.Tag[],
  level: number,
  prefix: string = ""
): any[] {
  if (tags.length === 0) {
    return [];
  }
  //   @ts-ignore
  const groups = Object.groupBy(tags, (tag: Taguette.Tag) =>
    getTagParts(tag.path).at(level)
  );
  type Entry = [string, Taguette.Tag[] | undefined];
  const entries = Object.entries(groups) as Entry[];
  return entries.map(([label, familyTags]) => {
    familyTags = familyTags || [];
    const path = prefix + label;
    const parent = familyTags.find((tag) => tag.path === path);
    const childTags = familyTags.filter((tag) => tag.path !== path);
    return {
      label,
      path,
      level,
      selected: false,
      expanded: false,
      children:
        childTags.length > 0
          ? getBranches(childTags, level + 1, path + SEPARATOR)
          : [],
    } as const;
  });
}

function getBranch(
  tags: Taguette.Tag[],
  level: number,
  prefix: string = ""
): Set<TagTreeItem> {
  if (!tags) {
    return new Set<TagTreeItem>();
  }
  //   @ts-ignore
  const branches = Object.groupBy(tags, (tag: Taguette.Tag) =>
    getTagParts(tag.path).at(level)
  );
  const branchArr: TagTreeItem[] = Object.entries(branches)
    .map(
      ([label, subTags]) =>
        ({
          label,
          path: prefix + label,
          level,
          selected: false,
          expanded: false,
          subTags,
        } as any)
    )
    .map(
      ({ subTags, ...item }) =>
        ({ ...item, family: splitChildrenAndParent(subTags, item.path) } as any)
    )
    .map(
      ({ family, ...item }) =>
        ({
          ...item,
          children: getBranch(
            family.children,
            level + 1,
            item.path + SEPARATOR
          ),
          tag: family.parent,
          isTag: () => !!family.parent,
        } as TagTreeItem)
    );
  return new Set(branchArr);
}

function splitChildrenAndParent(tags: Taguette.Tag[], path: string) {
  //@ts-ignore
  let { true: parents, false: children } = Object.groupBy(
    tags,
    (tag: Taguette.Tag) => tag.path === path
  );
  parents = parents || [];
  const [parent] = parents;
  return { parent, children };
}
function getLeaf(tags: Taguette.Tag[], level: number) {}

function compareTags(a: Taguette.Tag, b: Taguette.Tag) {
  return a.path.localeCompare(b.path);
}

export function maxLevels(tags: Taguette.Tag[]) {
  return tags.reduce((max, tag) => {
    const parts = getTagParts(tag.path);
    return Math.max(max, parts.length);
  }, 0);
}
export function entrify(tags: Taguette.Tag[]): [number, string][] {
  return tags.map(({ id, path }: Taguette.Tag) => [id, path]);
}
