import { ContextMenu } from "./ContextMenu";
import Stack from "@mui/material/Stack";
import { useSnackbar } from "notistack";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useRef, useMemo, useEffect, Dispatch } from "preact/compat";
import { signalReady, dbs } from "../../../signals";
import Divider from "@mui/material/Divider";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";

import CardContent from "@mui/material/CardContent";
import ListItemIcon from "@mui/material/ListItemIcon";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ListItemText from "@mui/material/ListItemText";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Typography from "@mui/material/Typography";
import ChildIcon from "@mui/icons-material/SubdirectoryArrowRight";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
// import FolderIcon from "@mui/icons-material/Folder";
import FolderIcon from "@mui/icons-material/FolderOutlined";
import StarFolderIcon from "@mui/icons-material/FolderSpecial";
import TagIcon from "@mui/icons-material/Sell";
// import TagIcon from "@mui/icons-material/SellOutlined";
import DashIcon from "@mui/icons-material/Remove";
import BulletIcon from "@mui/icons-material/Circle";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import StarIcon from "@mui/icons-material/Star";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import LaunchIcon from "@mui/icons-material/Launch";
import EditIcon from "@mui/icons-material/Edit";
import TextIcon from "@mui/icons-material/Subject";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { TreeItem2GroupTransition } from "@mui/x-tree-view";

import { ItemTagMap, useTreeContext } from "../../../contexts/TagTreeContext";
import { useTagTreeItemContext } from "./TagTreeItemContext";
import StyledTreeItem from "./StyledTreeItem";
import RenderMultipleTagTreeItems, {
  TagTreeItem,
} from "./MultipleTagTreeItems";
import Tooltip from "@mui/material/Tooltip";
import * as popups from "../../../popups";
import { Link } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TagChip } from "../../TagChip";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { useTheme } from "@mui/material/styles";
import { StateUpdater } from "preact/hooks";
import { memo } from "preact/compat";

export default function RenderSingleTagTreeItem() {
  const { handleContextMenu, item } = useTagTreeItemContext();
  const { setExpandedItems } = useTreeContext();

  useEffect(() => {
    console.log("tree item context changed");
  }, [useTagTreeItemContext()]);

  const { isOver, setNodeRef: dropRef } = useDroppable({
    id: `droppables.${item.path}`,
    data: { item },
  });
  const {
    attributes,
    listeners,
    setNodeRef: dragRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `draggables.${item.path}`,
    data: { item },
  });
  const dragSx = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;
  // const [hovering, hoverProps] = useHover();

  const ttText = item.isTag ? item.path : `category '${item.path}'`;
  const ancestors = item.familyTags.filter((tag) => tag.path !== item.path);

  const Icon = item.isTag ? StarFolderIcon : FolderIcon;
  const actions = [
    {
      label: `view ${item.isTag ? "tag" : "category"}`,
      icon: LaunchIcon,
      link: item.tag ? `/tags/${item.tag.id}` : `/category/${item.path}`,
    },
  ];

  const textPrimary = useTheme().palette?.text?.primary || "green";
  // const children = memo(() => (
  //   <RenderMultipleTagTreeItems tags={ancestors} level={item.level} />
  // ));
  return (
    <StyledTreeItem
      sx={{
        border: isOver ? `.125rem solid ${textPrimary}` : "",
      }}
      slots={{
        expandIcon: () => (
          <ExpansionControl
            icon={ExpandMoreIcon}
            item={item}
            setExpandedItems={setExpandedItems}
          />
        ),

        collapseIcon: () => (
          <ExpansionControl
            icon={ChevronRightIcon}
            item={item}
            setExpandedItems={setExpandedItems}
          />
        ),
        endIcon: TagIcon,
      }}
      key={item.path}
      itemId={item.path}
      label={
        <Stack
          ref={dropRef}
          direction="row"
          spacing={1}
          alignItems="center"
          onContextMenu={handleContextMenu}
        >
          <Stack
            direction="row"
            sx={{ pl: 0.5, alignItems: "center" }}
            ref={dragRef}
            // style={dragSx}
            {...listeners}
            {...attributes}
          >
            <DragIndicatorIcon fontSize="small" />
          </Stack>
          <TagChip
            tag={isDragging ? item.path : item.label}
            specialColor={!item.isTag}
          />
          <CountSticker iconComponent={TextIcon} value={item.useCount} />
          <TagInfoPreview item={item} />
          <ButtonGroup aria-label="tag tree item action button group">
            {actions.map((action) => (
              <IconButton
                aria-label={action.label}
                {...(action.link
                  ? {
                      component: Link,
                      to: action.link,
                      disabled: !item.isTag,
                    }
                  : {})}
              >
                {action.icon({
                  sx: { fontSize: "1rem" },
                })}
              </IconButton>
            ))}
          </ButtonGroup>
          <ContextMenu />
        </Stack>
      }
    >
      {ancestors.length > 0 && (
        <RenderMultipleTagTreeItems tags={ancestors} level={item.level} />
      )}
    </StyledTreeItem>
  );
}

function CountSticker({
  value,
  iconComponent: IconComponent,
}: {
  value: number;
  iconComponent: typeof TextIcon;
}) {
  return (
    <Stack
      direction="row"
      component={Paper}
      variant="outlined"
      spacing={0.25}
      sx={{
        backgroundColor: "primary.200",
        backgroundImage: "primary.200",
        color: "black",
        alignItems: "center",
        px: 0.25,
      }}
    >
      <IconComponent fontSize="small" />
      <Divider orientation="vertical" flexItem />
      <Typography>
        <Typography fontSize="small" sx={{ px: 0.25 }}>
          {value}
        </Typography>
      </Typography>
    </Stack>
  );
}

function TagInfoPreview({ item }: { item: TagTreeItem }) {
  function InfoPopover() {
    return <TagCard item={item} />;
  }
  const m0p0Sx = { sx: { m: 0, p: 0 } };
  return (
    <Stack direction="row" sx={{ pl: 0.5, alignItems: "center" }}>
      <Tooltip
        title={<InfoPopover />}
        slotProps={{ popper: m0p0Sx, tooltip: m0p0Sx }}
        placement="right-start"
      >
        <InfoIcon fontSize="small" />
      </Tooltip>
    </Stack>
  );
}

function TagCard({ item }: { item: TagTreeItem }) {
  // const { item } = useTagTreeItemContext();
  const tag: any = item.tag;
  const path = item.path;
  const description = tag ? tag.description : "This is a category only.";
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography color="text.secondary">Full Path</Typography>
        <Typography fontSize={"1.5rem"}>{path}</Typography>
        <Typography color="text.secondary" gutterBottom>
          Description
        </Typography>
        <Typography>{description}</Typography>
      </CardContent>
    </Card>
  );
}
function ExpansionControl({
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
