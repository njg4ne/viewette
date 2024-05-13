import { dbs, signalReady } from "../signals";
import { useLoadingContext } from "../contexts/LoadingContext";
import { TaguetteDb } from "../db";
import { useState, useEffect } from "preact/compat";

export default function useDb<T>(
  initialValue: T,
  sql: string,
  bindings: Record<string, number | string> = {}
) {
  const { loading } = useLoadingContext();
  const [data, setData] = useState<T>(initialValue);
  useEffect(() => {
    if (loading || !signalReady(dbs)) return;
    const db: TaguetteDb = dbs.value;
    db.transactAll([{ sql, bindings }]).then(([newData]) => {
      setData(newData as T);
    });
  }, [loading, dbs.value]);
  return data;
}
