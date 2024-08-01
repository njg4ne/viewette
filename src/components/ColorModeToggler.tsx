
import { useColorModeContext } from "../theme";
import { useTheme } from "@mui/material/styles";

import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

export function ColorModeToggler() {
    const theme = useTheme();
    const colorMode = useColorModeContext();
    // const tooltipText = `Toggle to ${theme.palette.mode === "dark" ? "light" : "dark"
    //     } mode`;
    const button = <IconButton
        sx={{ ml: 1 }}
        onClick={colorMode.toggleColorMode}
        color="inherit"
    >
        {theme.palette.mode === "dark" ? (
            <Brightness7Icon />
        ) : (
            <Brightness4Icon />
        )}
    </IconButton>
    return button
    return (
        <Box
            sx={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.default",
                color: "text.primary",
                borderRadius: 1,
                p: 1,
            }}
        >
            {theme.palette.mode} mode
            {button}
        </Box>
    );
}