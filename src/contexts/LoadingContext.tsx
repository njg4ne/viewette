import { useState, useContext, useEffect, useRef } from "preact/hooks";
import type { StateUpdater, Dispatch } from "preact/hooks";
import { createContext } from "preact/compat";
export const LoadingContext = createContext({
  loading: false,
  setLoading: (x: boolean) => {},
});
import * as popups from "../popups";
import { useSnackbar } from "notistack";
import { useId } from "preact/compat";

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoadingState] = useState(false);
  const { enqueueSnackbar: sbqr } = useSnackbar();
  const componentId = useId();

  useEffect(() => {
    window.addEventListener("storage", onStorageEvent);
    return () => window.removeEventListener("storage", onStorageEvent);
  }, []);

  // This event fires only when another tab changes local storage unless we dispatch it
  function onStorageEvent(e: StorageEvent | OwnStorageEvent) {
    const loadingStorageValue: boolean = e.newValue === "true";
    // console.log("storage event", loadingStorageValue);
    if (e.key === "loading") {
      setLoadingState(loadingStorageValue);
      if (!loadingStorageValue && e.constructor.name !== OwnStorageEvent.name) {
        const msg = "Syncing changes from other tabs.";
        popups.info(sbqr, msg);
      }
    }
  }

  class OwnStorageEvent extends StorageEvent {
    dispatcherId: string;
    constructor(loadingState: boolean) {
      const loadingValue: string = loadingState.toString();
      super("storage", {
        key: "loading",
        newValue: loadingValue,
      });
      this.dispatcherId = componentId;
    }
  }

  function setLoading(newValue: boolean) {
    // console.log("setLoading", newValue);
    const oldValue = window.localStorage.getItem("loading") === "true";
    if (newValue === oldValue) return;
    window.localStorage.setItem("loading", newValue.toString());
    window.dispatchEvent(new OwnStorageEvent(newValue));
  }

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoadingContext() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
