import { Dispatch } from "preact/compat";
import IconButton from "@mui/material/IconButton";
import { ItemTagMap } from "../contexts/TagTreeContext";
import { TagTreeItem } from "./TagTree/TagTreeItems/MultipleTagTreeItems";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { StateUpdater } from "preact/hooks";

export function ExpansionControl({
  icon: Icon,
  setExpandedItems,
  item,
}: {
  icon: typeof ExpandMoreIcon;
  setExpandedItems: Dispatch<StateUpdater<ItemTagMap>>;
  item: TagTreeItem;
}) {
  return (
    <IconButton
      sx={{
        borderRadius: 1,
        // mx: 1,
        p: 0.25,
      }}
      aria-label="change expansion"
      onClick={(e) => {
        e.stopPropagation();
        setExpandedItems((prev) => {
          if (prev?.has(item.path)) {
            prev.delete(item.path);
          } else {
            prev.set(item.path, item.tag);
          }
          return new Map(prev);
        });
      }}
    >
      <Icon />
    </IconButton>
  );
}
