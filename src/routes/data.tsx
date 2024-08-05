// import * as React from "preact/compat";
import type { ReactNode } from "preact/compat";
import StorageIcon from "@mui/icons-material/Storage";
import HomeIcon from "@mui/icons-material/Home";
import { SvgIconTypeMap } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import DatabaseManager from "../pages/DatabaseManager2";
import Home from "../pages/Home";
import TagTree from "../components/TagTree2";
type MuiIcon = OverridableComponent<SvgIconTypeMap<{}, "svg">> & {
  muiName: string;
};
interface RouteInfo {
  path: string;
  Element: ReactNode;
  Icon: MuiIcon;
  label?: string;
}

export default [
  {
    path: "/",
    Element: TagTree,
    Icon: HomeIcon,
    label: "TagTree",
  },
  {
    path: "/db",
    Element: DatabaseManager,
    Icon: StorageIcon,
    label: "Database",
  },
] as RouteInfo[];
