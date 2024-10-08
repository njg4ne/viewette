import * as React from "preact/compat";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import { useTheme, ThemeProvider, createTheme } from "@mui/material/styles";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import useMediaQuery from "@mui/material/useMediaQuery";

// color imports
import amber from "@mui/material/colors/amber";
import deepOrange from "@mui/material/colors/deepOrange";
import grey from "@mui/material/colors/grey";
import indigo from "@mui/material/colors/indigo";
import lightBlue from "@mui/material/colors/lightBlue";

import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
const contextValueFormat = { toggle: () => {} };
const ColorModeContext = React.createContext(contextValueFormat);

export function ColorModeToggler({ open }) {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const tooltipText = `Toggle to ${
    theme.palette.mode === "dark" ? "light" : "dark"
  } mode`;
  return (
    <ListItem disablePadding sx={{ display: "block" }}>
      <Tooltip title={`${tooltipText}`}>
        <ListItemButton
          onClick={colorMode.toggleColorMode}
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
            {theme.palette.mode === "dark" ? (
              <Brightness7Icon />
            ) : (
              <Brightness4Icon />
            )}
          </ListItemIcon>
          <ListItemText
            primary={`${theme.palette.mode} mode`}
            sx={{ opacity: open ? 1 : 0 }}
          />
        </ListItemButton>
      </Tooltip>
    </ListItem>
  );

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
      <IconButton
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
    </Box>
  );
}

export function ColorThemeProvider({ children }) {
  // const [mode, setMode] = React.useState < 'light' | 'dark' > ('light');
  const browserSaysLight = useMediaQuery("(prefers-color-scheme: light)");
  const [mode, setMode] = React.useState(browserSaysLight ? "light" : "dark");

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                // palette values for light mode
                primary: indigo,
                underline: indigo[300],
                // divider: amber[200],
                // text: "black",
                text: {
                  primary: grey[900],
                  secondary: grey[800],
                },
              }
            : {
                // palette values for dark mode
                primary: lightBlue,
                underline: lightBlue[800],
                // divider: deepOrange[700],
                // background: {
                //     default: deepOrange[900],
                //     paper: deepOrange[900],
                // },
                // text: "white",
                text: {
                  primary: "#fff",
                  secondary: grey[500],
                },
              }),
          // primary: {
          //     dark: 'red',
          //     main: '#651fff',
          //     light: '#834bff',
          //     contrastText: '#fff',
          // },
          // secondary: {
          //     dark: '#46b298',
          //     main: '#64ffda',
          //     light: '#83ffe1',
          //     contrastText: '#000',
          // }
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
}

// export the ColorModeContext.Provider with the name ColorModeProvider
// export function ColorModeProvider(props) {
