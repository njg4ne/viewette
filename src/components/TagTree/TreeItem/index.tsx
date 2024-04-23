import { TreeItem, treeItemClasses } from "@mui/x-tree-view/TreeItem";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import { useSnackbar } from "notistack";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState, useRef } from "react";
import { opfsDb } from "../../../signals";
import { styled, alpha } from '@mui/material/styles';
// import { Divider, Typography } from "@mui/material";
import Divider from "@mui/material/Divider";

import TagIcon from "@mui/icons-material/Sell";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListItemSubheader from "@mui/material/ListSubheader";
// import { ContentCopy } from "@mui/icons-material";
import TrashXIcon from '@mui/icons-material/DeleteForever';
import ContentCopy from '@mui/icons-material/ContentCopy';
import Typography from "@mui/material/Typography";
import ChildIcon from '@mui/icons-material/SubdirectoryArrowRight';
import { TagEntry } from "../types";

import { useLoadingContext, } from "../contexts/Loading";
import { useTreeContext } from "../contexts/Tree";
import {
    getPartialPath,
    SEPARATOR
} from "../utils";

type TagTreeItemProps = {
    tag: TagEntry;
    tags: TagEntry[];
    level: number;
    isTag: boolean;
    partialPath: string;
};
export function RenderOneTagItem({ tag, level, tags, isTag, partialPath }: TagTreeItemProps) {
    const { loading, setLoading } = useLoadingContext();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const { createTagFieldRef, setCreateTagValue, selectedItems } = useTreeContext();
    const ref = useRef<HTMLDivElement>(null);
    const [id, path] = tag;
    const parts = path.split(SEPARATOR);
    const label = parts.at(level);
    const sx = { wordWrap: "break-word", whiteSpace: "normal", py: .5, px: 1, borderRadius: 1, maxWidth: "100%", width: "fit-content" }
    const ttText = isTag ? path : `category '${label}'`

    const [contextMenu, setContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
    } | null>(null);

    const handleContextMenu = (event: MouseEvent) => {
        event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: event.clientX + 2,
                    mouseY: event.clientY - 6,
                }
                : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
                // Other native context menus might behave different.
                // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
                null,
        );
    };

    const handleClose = () => {
        setContextMenu(null);
    };

    const deleteTag = (_e: Event) => {
        if (loading) return;
        setLoading(true);
        opfsDb.value?.deleteTag(partialPath).then((deleted: any[]) => {
            const n = deleted?.length || 0;
            enqueueSnackbar(`Deleted ${n} tag${n > 1 ? "s" : ""} '${partialPath}' tags`, {
                variant: "info",
                anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "right",
                },
            });
            // console.log(deleted);
            setLoading(false)
            handleClose()
        }
        ).catch((e: Error) => {
            console.error(e);
            setLoading(false);
            handleClose()
        });
    }
    const deleteTags = (paths: string[]) => {
        console.log("Delete tags", paths)
        if (loading) return;

        let numDeleted = 0;
        try {
            for (const path of paths) {
                setLoading(true);
                opfsDb.value?.deleteTag(path).then((deleted: any[]) => {
                    numDeleted += 1;
                    console.log(`Deleted ${path}`, deleted);
                    setLoading(false);
                }
                ).catch((e: Error) => {
                    console.error(e);
                });
            }
        } catch (e) {
            console.error(e);
            enqueueSnackbar(`Only deleted ${numDeleted}/${paths.length} tags`, {
                variant: "error",
                anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "right",
                },
            });
        }
        finally {
            enqueueSnackbar(`Deleted ${numDeleted} tag${numDeleted > 1 ? "s" : ""}`, {
                variant: "info",
                anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "right",
                },
            });
            setLoading(false);
            handleClose()
        }
    }

    const CustomTreeItem = styled(TreeItem)(({ theme }) => ({
        [`& .${treeItemClasses.content}`]: {
            padding: theme.spacing(0.5, 1),
            margin: theme.spacing(0.2, 0),
        },
        [`& .${treeItemClasses.iconContainer}`]: {
            '& .close': {
                opacity: 0.3,
            },
        },
        [`& .${treeItemClasses.groupTransition}`]: {
            marginLeft: 15,
            paddingLeft: 18,
            borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
        },
    }));
    const isSelected = (id: string) => selectedItems.includes(id);
    const DeleteSelected = (partialPath) => !isSelected(partialPath) ? null : <MenuItem onClick={() => alert(selectedItems)}>
        <ListItemIcon>
            <TrashXIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Delete {selectedItems.length || 0} Selected</ListItemText>
    </MenuItem>
    return (
        <CustomTreeItem
            key={partialPath}
            // sx={{ cursor: 'context-menu' }}
            itemId={partialPath}
            label={<Stack spacing={0} direction="row" alignItems={"center"}
                onContextMenu={handleContextMenu}>

                {/* <Tooltip title={ttText} > */}
                <Typography
                    children={label}
                    // placement="right"
                    sx={{
                        bgcolor: `primary.${isTag ? "main" : "100"}`,
                        color: "primary.contrastText",
                        ...sx
                    }}
                />
                <Menu
                    open={contextMenu !== null}
                    onClose={handleClose}
                    anchorReference="anchorPosition"
                    anchorPosition={
                        contextMenu !== null
                            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                            : undefined
                    }
                >
                    <MenuItem sx={{ pointerEvents: 'none' }}>
                        <ListItemIcon>
                            <TagIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText><Typography variant="inherit" sx={{ wordWrap: "break-word", whiteSpace: "normal", maxWidth: "100%", width: "fit-content" }}>
                            {partialPath}
                        </Typography></ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={(e: Event) => {
                        navigator.clipboard.writeText(partialPath);
                        handleClose();
                    }}>
                        <ListItemIcon>
                            <ContentCopy fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Copy ID</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={deleteTag}>
                        <ListItemIcon>
                            <TrashXIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Delete All</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => {
                        handleClose();
                        const ref = createTagFieldRef.current;
                        if (ref) {
                            console.log(ref);
                            setCreateTagValue(partialPath);
                            // do again after a second
                            setTimeout(() => {
                                setCreateTagValue(partialPath + SEPARATOR);
                                createTagFieldRef?.current?.focus();
                            }, 0);

                        }

                        // elem.set
                        // const input = ref.current?.querySelector("input[name=newTag]") as HTMLInputElement;
                        // input.value = partialPath;

                    }}>
                        <ListItemIcon>
                            <ChildIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Create subtag</ListItemText>
                    </MenuItem>
                    {DeleteSelected(partialPath)}
                </Menu>
                {/* </Tooltip> */}
            </Stack >
            }
        >
            <RenderTagItems tags={tags} level={level} />
        </CustomTreeItem >
    );
}



type TagTreeItemSetProps = {
    tags: TagEntry[];
    level: number;
};
export function RenderTagItems({ tags, level: lastLevel }: TagTreeItemSetProps) {
    const level = lastLevel + 1;
    const unique = (tags: TagEntry[]) => tags.reduce((map, tag, i, tags) => {
        const [id, path] = tag;
        const key = getPartialPath(path, level);
        if (!map.has(key)) {
            map.set(key, tag);
        }
        return map;
    }, new Map<string, TagEntry>()).values();
    const levelTags = Array.from(unique(tags));
    const isChildOf =
        (parentPath: string) =>
            ([, path]: TagEntry) => {
                const res = (!amParentAndTag(["", path]) && path === parentPath) || (path.startsWith(`${parentPath}${SEPARATOR}`) && path !== parentPath)
                return res;
            }

    const haveMe = (tags: TagEntry[], myPartialPath: string) =>
        tags.some(([_, path]) => path === myPartialPath);
    const amParentAndTag = ([, path]: TagEntry) => haveMe(tags, getPartialPath(path, level));
    return (
        <>
            {levelTags.map((tag) => {
                const partialPath = getPartialPath(tag[1], level);
                return (

                    <RenderOneTagItem
                        key={tag[1]}
                        tag={tag}
                        tags={tags.filter(isChildOf(partialPath))}
                        level={level}
                        isTag={amParentAndTag(tag)}
                        partialPath={getPartialPath(tag.at(1)!, level)}
                    />
                )
            })}
        </>
    );
}
