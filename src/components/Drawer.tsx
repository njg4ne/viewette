import * as React from "preact/compat";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import HomeIcon from "@mui/icons-material/Home";
import StorageIcon from "@mui/icons-material/Storage";
import TextIcon from "@mui/icons-material/Subject";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import ExportIcon from "@mui/icons-material/SystemUpdateAlt";
import { Link } from "react-router-dom";
import MuiLink from "@mui/material/Link";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

import { ColorModeToggler } from "./ColorModeTheme";
import { FilterToggler } from "./FilterToggler";

import TagIcon from "@mui/icons-material/Sell";
import ShortTextIcon from "@mui/icons-material/ShortText";
import HelpIcon from "@mui/icons-material/Help";
const sections = [
  { text: "Home", icon: <HomeIcon />, path: "/" },
  { text: "Highlights", icon: <TextIcon />, path: "/highlights" },
  { text: "Tags", icon: <TagIcon />, path: "/tags" },
  { text: "Database", icon: <StorageIcon />, path: "/db" },
  {
    text: "Tags SVG",
    icon: <ImageOutlinedIcon />,
    path: "/export/tags/svg",
  },
  {
    text: "XLSX Summary",
    icon: <ExportIcon />,
    path: "/export/taggings/xlsx",
  },
  { text: "Help", icon: <HelpIcon />, path: "/help" },
];

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  //@ts-expect-error
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  //@ts-expect-error
  ...theme.mixins.toolbar,
}));

const openedMixinMain = (theme: Theme): CSSObject => ({
  width: `calc(100% - (${drawerWidth}px + 1px))`,
  //   width: `50%`,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
});
const closedMixinMain = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  width: `calc(100% - (${theme.spacing(7)} + 1px))`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(100% - (${theme.spacing(8)} + 1px))`,
  },
});
const Main = styled(Container, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  ...(open && {
    ...openedMixinMain(theme),
  }),
  ...(!open && {
    ...closedMixinMain(theme),
  }),
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  flexWrap: "nowrap",
  // backgroundColor: "red",
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function MiniDrawer({
  children,
}: {
  children: React.ReactNode[] | React.ReactNode;
}) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <MuiLink underline="none" component={Link} to="/" color="inherit">
            <Typography variant="h6" noWrap>
              Taguette 2.0 Prototype
            </Typography>
          </MuiLink>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        {/* @ts-expect-error */}
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {sections.map(({ text, icon, path }, index) => (
            <ListItem key={text} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                component={Link}
                to={path}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {icon}
                </ListItemIcon>
                <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <FilterToggler open={open} />
          <ColorModeToggler open={open} />
        </List>
      </Drawer>
      <Main disableGutters open={open}>
        {/* @ts-expect-error */}
        <DrawerHeader />
        {children}
      </Main>
    </Box>
  );
}
