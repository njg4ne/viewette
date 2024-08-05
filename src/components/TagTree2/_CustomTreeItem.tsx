import { forwardRef } from "preact/compat";
import { Ref } from "preact/hooks";
import clsx from "clsx";
import {
  unstable_useTreeItem2 as useTreeItem2,
  UseTreeItem2Parameters,
} from "@mui/x-tree-view/useTreeItem2";
import {
  TreeItem2Content,
  TreeItem2IconContainer,
  TreeItem2Label,
  TreeItem2Root,
  TreeItem2GroupTransition,
} from "@mui/x-tree-view/TreeItem2";
import { TreeItem2Provider } from "@mui/x-tree-view/TreeItem2Provider";
import { TreeItem2Icon } from "@mui/x-tree-view";
import { TagChip } from "../../TagChip";

// const p : TreeItem2IconProps;
export const _CustomTreeItem = forwardRef(
  (props: UseTreeItem2Parameters, ref: Ref<HTMLLIElement>) => {
    const { id, itemId, label, disabled, children, ...other } = props;

    const {
      getRootProps,
      getContentProps,
      getIconContainerProps,
      // getCheckboxProps,
      getLabelProps,
      getGroupTransitionProps,
      status,
      publicAPI,
    } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref });

    const item = publicAPI.getItem(itemId);
    // const expandable = isExpandable(children);
    // let icon = FolderRounded;
    return (
      <TreeItem2Provider itemId={itemId}>
        <TreeItem2Root {...getRootProps(other)}>
          <TreeItem2Content
            {...getContentProps({
              className: clsx("content", {
                "Mui-expanded": status.expanded,
                "Mui-selected": status.selected,
                "Mui-focused": status.focused,
                "Mui-disabled": status.disabled,
              }),
            })}
          >
            <TreeItem2IconContainer {...getIconContainerProps()}>
              <TreeItem2Icon status={status} />
            </TreeItem2IconContainer>
            {/* <Checkbox {...getCheckboxProps()} /> */}
            <TreeItem2Label sx={{ maxWidth: "max-content" }}>
              {/* <TagChip tag={label as string} />
               */}
              {label}
            </TreeItem2Label>
          </TreeItem2Content>
          {/* {children && <TransitionComponent {...getGroupTransitionProps()} />}
           */}
          {children && (
            <TreeItem2GroupTransition {...getGroupTransitionProps()} />
          )}
        </TreeItem2Root>
      </TreeItem2Provider>
    );
  }
);
