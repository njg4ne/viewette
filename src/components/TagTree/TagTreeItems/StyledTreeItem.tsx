import { TreeItem, treeItemClasses } from "@mui/x-tree-view/TreeItem";
import { TreeItem2 } from "@mui/x-tree-view/TreeItem2";

import { styled, alpha } from "@mui/material/styles";

export const StyledTreeItem = styled(TreeItem2)(({ theme }) => ({
  [`& .${treeItemClasses.content}`]: {
    padding: theme.spacing(0.5, 1),
    margin: theme.spacing(0.2, 0),
  },
  [`& .${treeItemClasses.iconContainer}`]: {
    "& .close": {
      opacity: 0.3,
    },
  },
  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
  width: "fit-content",
}));
export default StyledTreeItem;
