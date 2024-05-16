import { dbs, signalReady } from "../signals";
import { useLoadingContext } from "../contexts/LoadingContext";
import { TaguetteDb } from "../db";
import { useState, useEffect } from "preact/compat";

export default function useModel<T>(
  initialValue: T,
  model: (db: TaguetteDb) => () => Promise<T>,
  dependencies: unknown[]
) {
  const { loading } = useLoadingContext();
  const [data, setData] = useState<T>(initialValue);
  const getData = async () => {
    if (!signalReady(dbs)) return;
    const db: TaguetteDb = dbs.value;
    setData(await model(db)());
  };
  useEffect(() => {
    if (loading) return;
    getData();
  }, [loading]);

  useEffect(() => {
    getData();
  }, [dbs.value, ...dependencies]);
  return data;
}
