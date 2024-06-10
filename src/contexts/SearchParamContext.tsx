import { useState, useContext, useEffect, useRef } from "preact/hooks";
import type { StateUpdater, Dispatch } from "preact/hooks";
import { createContext } from "preact/compat";
import useDebouncedSearchParam from "../hooks/useDebouncedSearchParam";
export const SearchParamContext = createContext([] as any);

export function SearchParamProvider({
  children,
  keys,
}: {
  children: React.ReactNode;
  keys: string[];
}) {
  const state = keys.reduce(
    (acc: Object, key: string) =>
      Object.assign(acc, { [key]: useDebouncedSearchParam({ key }) }),
    {}
  );
  return (
    <SearchParamContext.Provider value={state}>
      {children}
    </SearchParamContext.Provider>
  );
}

export function useSearchParamContext(key: string) {
  const context = useContext(SearchParamContext);
  if (context === undefined) {
    throw new Error("useSearchParam must be used within a SearchParamProvider");
  }
  return context[key];
}
