// import * as React from "preact/compat";
import { ForwardedRef } from "preact/compat";
import { dbs, signalReady } from "../../../signals";
import { useLoadingContext } from "../../../contexts/LoadingContext";
import { useEffect, useMemo, useState } from "preact/hooks";
import { SEPARATOR, getTagParts } from "../utils";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
// import { treeItemClasses } from "@mui/x-tree-view/TreeItem";
import { TreeItem2 } from "@mui/x-tree-view/TreeItem2";
import Checkbox from "@mui/material/Checkbox";

// import * as ti2 from "@mui/x-tree-view/TreeItem2";
// ti2.
// import { TreeItem2Icon } from "@mui/x-tree-view/TreeItem2Icon";
import { TreeViewBaseItem } from "@mui/x-tree-view/models";
import { TreeItem2IconProps, useTreeViewApiRef } from "@mui/x-tree-view";
import { TagChip } from "../../TagChip";

// TreeViewBaseItem[]

export default function TreeView2() {
  const apiRef = useTreeViewApiRef();
  const tags = useTags();
  const branches = useMemo(() => getBranches(tags, 0), [tags]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  useEffect(() => {
    setExpandedItems(getAllItemIds(branches));
  }, [branches]);
  const handleExpandedItemsChange = (event: Event, itemIds: string[]) => {
    setExpandedItems(itemIds);
  };
  const handleSelectedItemsChange = (event: Event, itemIds: string[]) => {
    console.log("selected", itemIds);
    setSelectedItems(itemIds);
  };
  const handleToggleSelection = (
    event: Event,
    itemId: string,
    isSelected: boolean
  ) => {
    const item = apiRef.current?.getItem(itemId);
    const relevant = getAllItemIds([item as DataTree]);
    setSelectedItems((prev) =>
      isSelected
        ? [...prev, itemId, ...relevant]
        : prev.filter((id) => !relevant.includes(id))
    );
  };
  return (
    <Box sx={{ minHeight: 352, minWidth: 250 }}>
      <RichTreeView
        multiSelect
        expandedItems={expandedItems}
        selectedItems={selectedItems}
        onExpandedItemsChange={handleExpandedItemsChange}
        // onSelectedItemsChange={handleSelectedItemsChange}
        onItemSelectionToggle={handleToggleSelection}
        items={branches}
        getItemId={(itm) => itm.path}
        slots={{ item: TreeItem3 }}
        apiRef={apiRef}
      />
    </Box>
  );
}

function TreeItem3(props: any) {
  props.label = <TagChip sx={{ maxWidth: "max-content" }} tag={props.label} />;
  return <TreeItem2 {...props} />;
}

function useTags() {
  const [tags, setTags] = useState<Taguette.Tag[]>([]);
  const { loading } = useLoadingContext();
  useEffect(() => {
    // console.log("fetching tags");
    fetchTags(loading).then(([newTags]) => {
      setTags(newTags as Taguette.Tag[]);
    });
  }, [dbs.value, loading]);
  return tags;
}
async function fetchTags(loading: boolean) {
  if (loading || !signalReady(dbs)) return [];
  const sql = `SELECT * FROM tags;`;
  return await dbs.value.transactAll([{ sql }]);
}

interface DataTree {
  path: string;
  children?: DataTree[];
}
function getAllItemIds(branches: DataTree[]): string[] {
  const res = branches.flatMap((branch) => {
    const paths = [branch.path];
    if (branch.children) {
      paths.push(...getAllItemIds(branch.children));
    }
    return paths;
  });
  //   console.log(res);
  return res;
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
      //   id: path,
      label,
      content: <Typography>{label}</Typography>,
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

// type FileType =
//   | "image"
//   | "pdf"
//   | "doc"
//   | "video"
//   | "folder"
//   | "pinned"
//   | "trash";

// type ExtendedTreeItemProps = {
//   fileType?: FileType;
//   id: string;
//   label: string;
// };

// const ITEMS: TreeViewBaseItem<ExtendedTreeItemProps>[] = [
//   {
//     id: "1",
//     label: "Documents",
//     children: [
//       {
//         id: "1.1",
//         label: "Company",
//         children: [
//           { id: "1.1.1", label: "Invoice", fileType: "pdf" },
//           { id: "1.1.2", label: "Meeting notes", fileType: "doc" },
//           { id: "1.1.3", label: "Tasks list", fileType: "doc" },
//           { id: "1.1.4", label: "Equipment", fileType: "pdf" },
//           { id: "1.1.5", label: "Video conference", fileType: "video" },
//         ],
//       },
//       { id: "1.2", label: "Personal", fileType: "folder" },
//       { id: "1.3", label: "Group photo", fileType: "image" },
//     ],
//   },
//   {
//     id: "2",
//     label: "Bookmarked",
//     fileType: "pinned",
//     children: [
//       { id: "2.1", label: "Learning materials", fileType: "folder" },
//       { id: "2.2", label: "News", fileType: "folder" },
//       { id: "2.3", label: "Forums", fileType: "folder" },
//       { id: "2.4", label: "Travel documents", fileType: "pdf" },
//     ],
//   },
//   { id: "3", label: "History", fileType: "folder" },
//   { id: "4", label: "Trash", fileType: "trash" },
// ];

// function DotIcon() {
//   return (
//     <Box
//       sx={{
//         width: 6,
//         height: 6,
//         borderRadius: "70%",
//         bgcolor: "warning.main",
//         display: "inline-block",
//         verticalAlign: "middle",
//         zIndex: 1,
//         mx: 1,
//       }}
//     />
//   );
// }
// declare module "react" {
//   interface CSSProperties {
//     "--tree-view-color"?: string;
//     "--tree-view-bg-color"?: string;
//   }
// }

// const StyledTreeItemRoot = styled(TreeItem2Root)(({ theme }) => ({
//   color:
//     theme.palette.mode === "light"
//       ? theme.palette.grey[800]
//       : theme.palette.grey[400],
//   position: "relative",
//   [`& .${treeItemClasses.groupTransition}`]: {
//     marginLeft: theme.spacing(3.5),
//   },
// })) as unknown as typeof TreeItem2Root;

// const CustomTreeItemContent = styled(TreeItem2Content)(({ theme }) => ({
//   flexDirection: "row-reverse",
//   borderRadius: theme.spacing(0.7),
//   marginBottom: theme.spacing(0.5),
//   marginTop: theme.spacing(0.5),
//   padding: theme.spacing(0.5),
//   paddingRight: theme.spacing(1),
//   fontWeight: 500,
//   [`&.Mui-expanded `]: {
//     "&:not(.Mui-focused, .Mui-selected, .Mui-selected.Mui-focused) .labelIcon":
//       {
//         color:
//           theme.palette.mode === "light"
//             ? theme.palette.primary.main
//             : theme.palette.primary.dark,
//       },
//     "&::before": {
//       content: '""',
//       display: "block",
//       position: "absolute",
//       left: "16px",
//       top: "44px",
//       height: "calc(100% - 48px)",
//       width: "1.5px",
//       backgroundColor:
//         theme.palette.mode === "light"
//           ? theme.palette.grey[300]
//           : theme.palette.grey[700],
//     },
//   },
//   "&:hover": {
//     backgroundColor: alpha(theme.palette.primary.main, 0.1),
//     color:
//       theme.palette.mode === "light" ? theme.palette.primary.main : "white",
//   },
//   [`&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused`]: {
//     backgroundColor:
//       theme.palette.mode === "light"
//         ? theme.palette.primary.main
//         : theme.palette.primary.dark,
//     color: theme.palette.primary.contrastText,
//   },
// }));

// const StyledTreeItemLabelText = styled(Typography)({
//   color: "inherit",
//   fontFamily: "General Sans",
//   fontWeight: 500,
// }) as unknown as typeof Typography;

// interface CustomLabelProps {
//   children: React.ReactNode;
//   icon?: React.ElementType;
//   expandable?: boolean;
// }

// function CustomLabel({
//   icon: Icon,
//   expandable,
//   children,
//   ...other
// }: CustomLabelProps) {
//   return (
//     <TreeItem2Label
//       {...other}
//       sx={{
//         display: "flex",
//         alignItems: "center",
//       }}
//     >
//       {Icon && (
//         <Box
//           component={Icon}
//           className="labelIcon"
//           color="inherit"
//           sx={{ mr: 1, fontSize: "1.2rem" }}
//         />
//       )}

//       <StyledTreeItemLabelText variant="body2">
//         {children}
//       </StyledTreeItemLabelText>
//       {expandable && <DotIcon />}
//     </TreeItem2Label>
//   );
// }

// const isExpandable = (reactChildren: React.ReactNode) => {
//   if (Array.isArray(reactChildren)) {
//     return reactChildren.length > 0 && reactChildren.some(isExpandable);
//   }
//   return Boolean(reactChildren);
// };

// const getIconFromFileType = (fileType: FileType) => {
//   switch (fileType) {
//     case "image":
//       return ImageIcon;
//     case "pdf":
//       return PictureAsPdfIcon;
//     case "doc":
//       return ArticleIcon;
//     case "video":
//       return VideoCameraBackIcon;
//     case "folder":
//       return FolderRounded;
//     case "pinned":
//       return FolderOpenIcon;
//     case "trash":
//       return DeleteIcon;
//     default:
//       return ArticleIcon;
//   }
// };

// interface CustomTreeItemProps
//   extends Omit<UseTreeItem2Parameters, "rootRef">,
//     Omit<React.HTMLAttributes<HTMLLIElement>, "onFocus"> {}

// const CustomTreeItem = React.forwardRef(function CustomTreeItem(
//   props: CustomTreeItemProps,
//   ref: React.Ref<HTMLLIElement>
// ) {
//   const { id, itemId, label, disabled, children, ...other } = props;

//   const {
//     getRootProps,
//     getContentProps,
//     getIconContainerProps,
//     // getCheckboxProps,
//     getLabelProps,
//     getGroupTransitionProps,
//     status,
//     publicAPI,
//   } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref });

//   const item = publicAPI.getItem(itemId);
//   const expandable = isExpandable(children);
//   let icon;
//   if (expandable) {
//     icon = FolderRounded;
//   } else if (item.fileType) {
//     icon = getIconFromFileType(item.fileType);
//   }

//   return (
//     <TreeItem2Provider itemId={itemId}>
//       <StyledTreeItemRoot {...getRootProps(other)}>
//         <CustomTreeItemContent
//           {...getContentProps({
//             className: clsx("content", {
//               "Mui-expanded": status.expanded,
//               "Mui-selected": status.selected,
//               "Mui-focused": status.focused,
//               "Mui-disabled": status.disabled,
//             }),
//           })}
//         >
//           <TreeItem2IconContainer {...getIconContainerProps()}>
//             <TreeItem2Icon status={status} />
//           </TreeItem2IconContainer>
//           <Checkbox {...getCheckboxProps()} />
//           <CustomLabel
//             {...getLabelProps({
//               icon,
//               expandable: expandable && status.expanded,
//             })}
//           />
//         </CustomTreeItemContent>
//         {children && <TransitionComponent {...getGroupTransitionProps()} />}
//       </StyledTreeItemRoot>
//     </TreeItem2Provider>
//   );
// });
