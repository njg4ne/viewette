import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import { useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import useMediaQuery from '@mui/material/useMediaQuery';

// color imports
import amber from '@mui/material/colors/amber';
import deepOrange from '@mui/material/colors/deepOrange';
import grey from '@mui/material/colors/grey';
import indigo from '@mui/material/colors/indigo';
import lightBlue from '@mui/material/colors/lightBlue';

const contextValueFormat = { toggle: () => { } }
const ColorModeContext = React.createContext(contextValueFormat);

export function ColorModeToggler() {
    const theme = useTheme();
    const colorMode = React.useContext(ColorModeContext);
    return (
        <Box
            sx={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                color: 'text.primary',
                borderRadius: 1,
                p: 1,
            }}
        >
            {theme.palette.mode} mode
            <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
                {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
        </Box>
    );
}


export function ColorThemeProvider({ children }) {
    // const [mode, setMode] = React.useState < 'light' | 'dark' > ('light');
    const browserSaysLight = useMediaQuery('(prefers-color-scheme: light)');
    const [mode, setMode] = React.useState(browserSaysLight ? 'light' : 'dark');

    const colorMode = React.useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        [],
    );

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    ...(mode === 'light'
                        ? {
                            // palette values for light mode
                            primary: indigo,
                            // divider: amber[200],
                            // text: {
                            //     primary: grey[900],
                            //     secondary: grey[800],
                            // },
                        }
                        : {
                            // palette values for dark mode
                            primary: lightBlue,
                            // divider: deepOrange[700],
                            // background: {
                            //     default: deepOrange[900],
                            //     paper: deepOrange[900],
                            // },
                            // text: {
                            //     primary: '#fff',
                            //     secondary: grey[500],
                            // },
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
                }
            }),
        [mode],
    );

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}

// export the ColorModeContext.Provider with the name ColorModeProvider
// export function ColorModeProvider(props) {