import * as React from "preact/compat";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import CssBaseline from '@mui/material/CssBaseline';
import grey from "@mui/material/colors/grey";
import indigo from "@mui/material/colors/indigo";
import lightBlue from "@mui/material/colors/lightBlue";

const contextValueFormat = { toggleColorMode: () => { } };
export const ColorModeContext = React.createContext(contextValueFormat);
export const useColorModeContext = () => React.useContext(ColorModeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
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
          mode: mode as any,
          ...(mode === "light"
            ? {
              // palette values for light mode
              primary: indigo,
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
              // divider: deepOrange[700],
              // background: {
              //     default: deepOrange[900],
              //     paper: deepOrange[900],
              // },
              // text: "white",
              text: {
                primary: '#fff',
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

  return (<><CssBaseline />
    <ColorModeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ColorModeContext.Provider>
  </>
  );
}
