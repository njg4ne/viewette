import { render } from "preact";
import "./index.css";
import { ThemeProvider } from "./theme";
import { ColorModeToggler } from "./components/ColorModeToggler";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import AppBar from "./components/AppBar";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import { HashRouter } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import appRoutes from "./routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();
function App() {
  return (
    <HashRouter future={{ v7_startTransition: true }}>
      <ThemeProvider>
        <Stack minHeight="100dvh" direction="column">
          <AppBar />
          <Paper sx={{ flexGrow: 1, borderRadius: 0 }}>
            <QueryClientProvider client={queryClient}>
              <Routes>
                {appRoutes.map(({ path, Element }) => (
                  <Route path={path} element={<Element />} />
                ))}
              </Routes>
            </QueryClientProvider>
          </Paper>
        </Stack>
      </ThemeProvider>
    </HashRouter>
  );
}

render(<App />, document.getElementById("app")!);
