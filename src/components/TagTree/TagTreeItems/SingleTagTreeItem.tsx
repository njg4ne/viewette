import { ContextMenu } from "./ContextMenu";
import Stack from "@mui/material/Stack";
import { useSnackbar } from "notistack";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState, useRef, useMemo, useEffect } from "preact/compat";
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

import { useLoadingContext } from "../../../contexts/LoadingContext";
import { useTreeContext } from "../../../contexts/TagTreeContext";
import {
  TagTreeItemProvider,
  useTagTreeItemContext,
} from "./TagTreeItemContext";
import { SEPARATOR, getTagParts } from "../utils";
import StyledTreeItem from "./StyledTreeItem";
import RenderMultipleTagTreeItems2, {
  TagTreeItem,
} from "./MultipleTagTreeItems";
import type { SxProps } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import * as popups from "../../../popups";
import { Link } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function RenderSingleTagTreeItem() {
  const { loading, setLoading } = useLoadingContext();
  const { enqueueSnackbar: sbqr, closeSnackbar } = useSnackbar();
  const { selectedItems } = useTreeContext();
  const { handleContextMenu, item } = useTagTreeItemContext();
  const { setExpandedItems, expandedItems } = useTreeContext();
  const ref = useRef<HTMLDivElement>(null);
  // const [hovering, hoverProps] = useHover();

  const ttText = item.isTag ? item.path : `category '${item.path}'`;
  const ancestors = item.familyTags.filter((tag) => tag.path !== item.path);

  const Icon = item.isTag ? StarFolderIcon : FolderIcon;
  // const Icon = () => (
  //   <CountSticker iconComponent={TextIcon} value={item.useCount} />
  // );
  // const Icon = useMemo(
  //   () => (item.isTag ? StarFolderIcon : FolderIcon),
  //   [item.isTag]
  // );
  // useEffect(() => {
  //   console.log("rendering a single tag tree item", item.path);
  // }, []);
  const actions = [
    {
      label: `view ${item.isTag ? "tag" : "category"}`,
      icon: LaunchIcon,
      // action: () => {
      //   popups.info(sbqr, `view ${item.isTag ? "tag" : "category"}`);
      // },
      // link: `/`,
      link: item.tag ? `/tags/${item.tag.id}` : `/category/${item.path}`,
    },
  ];
  function ExpnansionControl({ icon: Icon }: { icon: typeof ExpandMoreIcon }) {
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

  return (
    <StyledTreeItem
      // {...hoverProps}
      // sx={{ color: "text.primary", opacity: 0.8 }}
      slots={{
        expandIcon: () => <ExpnansionControl icon={ExpandMoreIcon} />,
        collapseIcon: () => <ExpnansionControl icon={ChevronRightIcon} />,
        endIcon: TagIcon,
      }}
      key={item.path} // sx={{ cursor: 'context-menu' }}
      itemId={item.path}
      label={
        // <>
        // <Tooltip title={ttText} placement="right">
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          onContextMenu={handleContextMenu}
        >
          <TagChip
            // tag={item[hovering ? "path" : "label"]}
            tag={item.label}
            specialColor={!item.isTag}
          />
          <CountSticker iconComponent={TextIcon} value={item.useCount} />
          <Preview />
          <ButtonGroup aria-label="tag tree item action button group">
            {actions.map((action) => (
              // <Tooltip title={action.label} placement="bottom">

              <IconButton
                aria-label={action.label}
                {...(action.link
                  ? { component: Link, to: action.link, disabled: !item.isTag }
                  : {})}
                // {...(!action.link ? { onClick: action.action } : {})}
              >
                {action.icon({
                  // fontSize: ".25rem",
                  sx: { fontSize: "1rem" },
                })}
              </IconButton>
              // </Tooltip>
            ))}
          </ButtonGroup>
          <ContextMenu />
        </Stack>
        // </Tooltip>
        //
        // </>
      }
    >
      {ancestors.length > 0 && (
        <RenderMultipleTagTreeItems2 tags={ancestors} level={item.level} />
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
      // elevation={1}
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

function Preview() {
  function InfoPopover() {
    return <TagCard />;
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

function TagCard() {
  const { item } = useTagTreeItemContext();
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
      {/* <CardActions>
        <Button
          onClick={save}
          disabled={loading}
          variant="outlined"
          sx={{
            marginBottom: 1,
            marginLeft: 1,
          }}
        >
          Save
        </Button>
      </CardActions> */}
    </Card>
  );
}
function useHover() {
  const [hovering, setHovering] = useState<boolean>(false);
  const onHoverProps = {
    onMouseEnter: () => setHovering(true),
    onMouseLeave: () => setHovering(false),
  };
  return [hovering, onHoverProps] as const;
}

export function TagChip({
  tag,
  specialColor = false,
  sx,
}: {
  tag: string;
  specialColor?: boolean;
  sx?: SxProps;
}) {
  const typeSx = {
    // wordWrap: "break-word",
    whiteSpace: "normal",
    py: 0.5,
    px: 1,
    borderRadius: 1,
  };
  // replace all SEPARATOR with SEPAR+ nowidthspace, keeping what is between
  const parts = getTagParts(tag);
  const wrapInParenIfContainsWhitespace = (str: string) => {
    return str.includes(" ") ? `(${str})` : str;
  };
  const tagSpecial = parts
    .map(wrapInParenIfContainsWhitespace)
    .join(SEPARATOR + "\u200B");
  // const tagSpecial = tag;
  return (
    <Typography
      sx={{
        bgcolor: `primary.${!specialColor ? "main" : "200"}`,
        color: "primary.contrastText",
        maxWidth: "100%",
        ...typeSx,
        ...sx,
      }}
    >
      {tagSpecial}
    </Typography>
  );
}

// function FolderCollapsed() {
//   const bxSx = {
//     position: "relative",
//   };
//   const centerSx = {
//     position: "absolute",
//     // top: "-50%",
//     left: "-50%",
//   };
//   const fgSx = {
//     ...centerSx,
//     zIndex: 1,
//   };
//   const bgSx = {
//     zIndex: 0,
//     fontSize: "1.5rem",
//     color: "primary.main",
//     pl: 0.5,
//     // textStroke: "3px black",
//   };
//   return (
//     <Stack direction="row" alignItems="center" sx={bxSx}>
//       <FolderIcon sx={bgSx} />
//       <ChevronRightIcon sx={fgSx} />
//     </Stack>
//   );
// }
