//OpfsDbContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "preact/compat";
import { useQuery } from "@tanstack/react-query";
import { OpfsDb } from "../db";
import init from "../db/init.sql?raw";

export const OpfsDbContext = createContext<OpfsDb | undefined>(undefined);
export const useOpfsDbContext = () => useContext(OpfsDbContext);

export function OpfsDbContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  let db: OpfsDb | undefined;
  const { isPending, error, data } = useQuery({
    queryKey: ["db"],
    queryFn: async () => {
      db = new OpfsDb();

      return db
        .readyTimeout(1000)
        .then(() => db!.exec(init))
        .then(() => db);
    },
  });

  return (
    <OpfsDbContext.Provider value={data}>
      {isPending || error ? null : children}
    </OpfsDbContext.Provider>
  );
}
