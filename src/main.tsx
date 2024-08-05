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
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { useEffect } from "preact/hooks";
import type { ReactNode } from "preact/compat";
import { OpfsDbContextProvider } from "./contexts/OpfsDbContext";
// import serviceWorkerUrl from "./serviceWorkers/custom/sw.js?url";

async function getTags() {
  const res = await fetch("/api/tags");
  const data = await res.json();
  console.log("DATA is", data);
  return data;
}
const queryClient = new QueryClient();
function App() {
  useEffect(() => {
    // getTags();
  }, []);

  return (
    <HashRouter future={{ v7_startTransition: true }}>
      <ThemeProvider>
        <Stack minHeight="100dvh" direction="column">
          <AppBar />
          <Paper sx={{ flexGrow: 1, borderRadius: 0 }}>
            <QueryClientProvider client={queryClient}>
              <OpfsDbContextProvider>
                <Routes>
                  {appRoutes.map(
                    ({ path, Element }: { path: string; Element: any }) => (
                      <Route path={path} element={<Element />} />
                    )
                  )}
                </Routes>
              </OpfsDbContextProvider>
            </QueryClientProvider>
          </Paper>
        </Stack>
      </ThemeProvider>
    </HashRouter>
  );
}

{
  /* <ServiceWorkerDependentContent></ServiceWorkerDependentContent> */
}
// function ServiceWorkerDependentContent() {
//   const { isPending, error, data } = useQuery({
//     queryKey: ["service-worker-health"],
//     queryFn: async () => {
//       return checkServiceWorkerHealth();
//     },
//   });
//   if (isPending) return "Loading...";
//   if (error) {
//     console.error(error);
//     return "An error occurred: " + error.message;
//   }
//   if (data !== "OK") {
//     window.location.reload();
//     return "Unhealthy";
//   }
//   return DbDependentContent();
// }

// function DbDependentContent() {
//   return (
//     <Routes>
//       {appRoutes.map(({ path, Element }: { path: string; Element: any }) => (
//         <Route path={path} element={<Element />} />
//       ))}
//     </Routes>
//   );
// }

async function checkServiceWorkerHealth() {
  // const localStorageKey =
  //   "service-worker-installation-watchdog-attempt-counter";
  // let attemptCount = parseInt(localStorage.getItem(localStorageKey) || "0", 10);
  const endpoint = "/service-worker/health";
  const response = await fetch(endpoint);
  const contentType = response.headers.get("content-type");
  if (contentType === "text/plain") {
    const text = await response.text();
    // localStorage.removeItem(localStorageKey);
    return text;
  }
  return "Unhealthy";
}

render(<App />, document.getElementById("app")!);
