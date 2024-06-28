import RenderSingleTagTreeItem from "./SingleTagTreeItem";
import { getTagParts, pathUpToLevel, SEPARATOR } from "../utils";
import { useTreeContext } from "../../../contexts/TagTreeContext";
import { TagTreeItemProvider } from "./TagTreeItemContext";
import { useEffect } from "preact/hooks";
export type TagTreeItem = {
  path: string;
  familyTags: Taguette.Tag[];
  level: number;
  label: string;
  isTag: boolean;
  useCount: number;
  tag?: Taguette.Tag;
};
type TagGroups = Map<string, Taguette.Tag[]>;
type TagTreeNodeSetProps = {
  tags: Taguette.Tag[];
  level: number;
};
export default function RenderMultipleTagTreeNodes({
  tags,
  level: lastLevel,
}: TagTreeNodeSetProps) {
  // const { allTags } = useTreeContext();
  // useEffect(() => {
  //   console.log("rendering category of", tags.length, "tags");
  // });
  const level = lastLevel + 1;

  let tagFamilies: TagGroups = new Map<string, Taguette.Tag[]>();
  const reducer = (groups: TagGroups, tag: Taguette.Tag) => {
    const { path } = tag;
    const key = pathUpToLevel(path, level);
    const group = groups.get(key) || [];
    group.push(tag);
    groups.set(key, group);
    return groups;
  };
  tagFamilies = tags.reduce(reducer, tagFamilies);
  const pathInGroup = (path: string, familyTags: Taguette.Tag[]): boolean => {
    return familyTags.some((tag) => tag.path === path);
  };
  const itemFor = (path: string, tags: Taguette.Tag[]): TagTreeItem => ({
    path,
    familyTags: tags,
    level,
    label: getTagParts(path).at(level) || "",
    isTag: pathInGroup(path, tags),
    useCount: 0,
  });
  const tagFamilyEntries = [...tagFamilies.entries()];
  //alphabetical by the part at level
  tagFamilyEntries.sort(([pathA], [pathB]) => {
    const labA = getTagParts(pathA).at(level) || "";
    const labB = getTagParts(pathB).at(level) || "";
    return labA.localeCompare(labB);
  });
  return (
    <>
      {tagFamilyEntries.map(([path, tagFamily]) => {
        return (
          <TagTreeItemProvider item={itemFor(path, tagFamily)} key={path}>
            <RenderSingleTagTreeItem />
          </TagTreeItemProvider>
        );
      })}
    </>
  );
}
