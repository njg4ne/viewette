import { useState, createContext, useContext } from "react";
import { StateUpdater } from "preact/hooks";

export const LoadingContext = createContext({
  loading: false,
  setLoading: {} as StateUpdater<boolean>,
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
