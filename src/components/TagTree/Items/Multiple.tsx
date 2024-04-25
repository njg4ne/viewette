import RenderSingleTagTreeItem from "./Single";
import { getPartialPath, SEPARATOR } from "../utils";


type TagTreeItemSetProps = {
    tags: Tag.Entry[];
    level: number;
};
export default function RenderMultipleTagTreeItems({
    tags, level: lastLevel,
}: TagTreeItemSetProps) {
    const level = lastLevel + 1;
    const unique = (tags: Tag.Entry[]) => tags
        .reduce((map, tag, i, tags) => {
            const [id, path] = tag;
            const key = getPartialPath(path, level);
            if (!map.has(key)) {
                map.set(key, tag);
            }
            return map;
        }, new Map<string, Tag.Entry>())
        .values();
    const levelTags = Array.from(unique(tags));
    const isChildOf = (parentPath: string) => ([, path]: Tag.Entry) => {
        const res = (!amParentAndTag(["", path]) && path === parentPath) ||
            (path.startsWith(`${parentPath}${SEPARATOR}`) && path !== parentPath);
        return res;
    };

    const haveMe = (tags: Tag.Entry[], myPartialPath: string) => tags.some(([_, path]) => path === myPartialPath);
    const amParentAndTag = ([, path]: Tag.Entry) => haveMe(tags, getPartialPath(path, level));
    return (
        <>
            {levelTags.map((tag) => {
                const partialPath = getPartialPath(tag[1], level);
                return (
                    <RenderSingleTagTreeItem
                        key={tag[1]}
                        tag={tag}
                        tags={tags.filter(isChildOf(partialPath))}
                        level={level}
                        isTag={amParentAndTag(tag)}
                        partialPath={getPartialPath(tag.at(1)!, level)} />
                );
            })}
        </>
    );
}
