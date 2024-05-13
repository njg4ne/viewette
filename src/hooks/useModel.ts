import { dbs, signalReady } from "../signals";
import { useLoadingContext } from "../contexts/LoadingContext";
import { TaguetteDb } from "../db";
import { useState, useEffect } from "preact/compat";

export default function useModel<T>(
  initialValue: T,
  model: (db: TaguetteDb) => () => Promise<T>
) {
  const { loading } = useLoadingContext();
  const [data, setData] = useState<T>(initialValue);
  useEffect(() => {
    if (loading || !signalReady(dbs)) return;
    const db: TaguetteDb = dbs.value;
    model(db)().then(setData);
  }, [loading, dbs.value]);
  return data;
}
