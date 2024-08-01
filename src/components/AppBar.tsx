import * as React from "preact/compat";
import MuiAppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { ColorModeToggler } from "./ColorModeToggler";
import appRoutes from "../routes";
import { Link } from "react-router-dom";
import MuiMenu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { RoutedLabel, RoutedIcon } from "./routed";

export default function AppBar() {
  return (
    // <Box {...props}>
    <MuiAppBar position="static">
      <Toolbar>
        <NavButton />
        <Typography variant="h6" component={Box} sx={{ flexGrow: 1 }}>
          Taguette 2.0 Prototype: <RoutedLabel />
        </Typography>
        <RoutedIcon />

        <ColorModeToggler />
      </Toolbar>
    </MuiAppBar>
    // </Box>
  );
}

function NavButton() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: Event & any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const buttonId = "site-navigation-menu-button";
  const buttonProps = {
    id: buttonId,
    "aria-controls": open ? "basic-menu" : undefined,
    "aria-haspopup": "true",
    "aria-expanded": open ? "true" : undefined,
    onClick: handleClick,
  };
  const menuProps = {
    id: "site-navigation-menu",
    anchorEl,
    open,
    onClose: handleClose,
    MenuListProps: {
      "aria-labelledby": buttonId,
      dense: true,
    },

    // autoFocus: false,
  };
  return (
    <>
      <MenuButton {...buttonProps} />
      <Menu {...menuProps} />
    </>
  );
}
function MenuButton(buttonProps: any) {
  return (
    <IconButton
      size="large"
      edge="start"
      color="inherit"
      aria-label="menu"
      sx={{ mr: 2 }}
      {...buttonProps}
    >
      <MenuIcon />
    </IconButton>
  );
}

function Menu(menuProps: any) {
  return (
    <MuiMenu {...menuProps}>
      {appRoutes.map(({ path, Icon, label }) => (
        <MenuItem key={path} component={Link} to={path}>
          <ListItemIcon>
            <Icon />
          </ListItemIcon>
          <ListItemText primary={label} />
        </MenuItem>
      ))}
    </MuiMenu>
  );
}
