import * as React from "preact/compat";


import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import FilterListIcon from '@mui/icons-material/FilterList';

const ACTIVE_DEFAULT = true;

const contextValueFormat = {
    toggle: () => { },
    active: ACTIVE_DEFAULT,
}
const FilterActiveContext = React.createContext(contextValueFormat);

export function FilterActiveProvider({ children }: { children: React.ReactNode }) {
    const [active, setActive] = React.useState(ACTIVE_DEFAULT);
    const toggle = () => setActive((prev) => !prev);
    return (
        <FilterActiveContext.Provider value={{ active, toggle }}>
            {children}
        </FilterActiveContext.Provider>
    );
}

export const useFilterActiveContext = () => React.useContext(FilterActiveContext);

export function FilterToggler({ open }: { open: boolean }) {
    const { active, toggle } = React.useContext(FilterActiveContext);
    const tooltipText = `${active ? "Hide" : "Show"} filters`;
    return (
        <ListItem disablePadding sx={{ display: "block" }}>
            <Tooltip title={`${tooltipText}`}>
                <ListItemButton
                    onClick={toggle}
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
                        <FilterListIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary={active ? "Hide" : "Show" + " filters"}
                        sx={{ opacity: open ? 1 : 0 }}
                    />
                </ListItemButton>
            </Tooltip>
        </ListItem>
    )
}