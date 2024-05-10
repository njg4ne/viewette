import { useState, useContext, StateUpdater } from "preact/hooks";
import { createContext, Dispatch } from "preact/compat";

export const LoadingContext = createContext({
  loading: false,
  setLoading: {} as Dispatch<StateUpdater<boolean>>,
});

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
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
