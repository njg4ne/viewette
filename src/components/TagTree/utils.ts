const SEPARATOR = ".";

function getTagParts(path: string) {
  return path.split(SEPARATOR);
}
function getPartialPath(path: string, level: number) {
  return getTagParts(path)
    .slice(0, level + 1)
    .join(SEPARATOR);
}
const pathUpToLevel = getPartialPath;
function getAllPartialPaths(path: string): string[] {
  const parts = getTagParts(path);
  return parts.map((_, i) => parts.slice(0, i + 1).join(SEPARATOR));
}
function areFamily(maybeParent: string, maybeChild: string) {
  return maybeChild.startsWith(`${maybeParent}${SEPARATOR}`);
}

// function getGenealogy(pathSubset: string[], allPaths: Record<string, string>) {
//   return pathSubset.reduce((acc: string[], parentPath: string) => {
//     const childIds = Object.entries(allPaths)
//       .filter(([_, childPath]) => areFamily(parentPath, childPath))
//       .map(([id, path]) => path);
//     const newIds = [parentPath, ...childIds];
//     acc.push(...newIds);
//     return acc;
//   }, []);
// }
function getGenealogy(itemPaths: string[], allTags: Taguette.Tag[]) {
  return itemPaths.reduce((acc: string[], parentPath: string) => {
    const childIds = allTags
      .filter((tag) => areFamily(parentPath, tag.path))
      .map((tag) => tag.path);
    const newIds = [parentPath, ...childIds];
    acc.push(...newIds);
    return acc;
  }, []);
}

function getTopLevelTags(allPaths: Record<string, string>) {
  return Object.values(allPaths).filter((path) => !path.includes(SEPARATOR));
}

export {
  getTagParts,
  getPartialPath,
  pathUpToLevel,
  getAllPartialPaths,
  areFamily,
  getGenealogy,
  getTopLevelTags,
  SEPARATOR,
};
