import { dbs, signalReady } from "../signals";
import { useLoadingContext } from "../contexts/LoadingContext";
import { TaguetteDb } from "../db";
import { useState, useEffect } from "preact/compat";

export default function useDb<T>(
  initialValue: T,
  dependencies: unknown[],
  sql: string,
  bindings: Record<string, number | string> = {}
) {
  // console.log(dependencies);
  const { loading } = useLoadingContext();
  const [data, setData] = useState<T>(initialValue);
  function getData() {
    if (!signalReady(dbs)) return;
    const db: TaguetteDb = dbs.value;
    db.transactAll([{ sql, bindings }]).then(([newData]) => {
      setData(newData as T);
    });
  }
  useEffect(() => {
    if (loading) return;
    getData();
  }, [loading]);
  useEffect(() => {
    // console.log("useDb dependencies changed", ...dependencies);
    getData();
  }, [dbs.value, ...dependencies]);
  // useEffect(() => {
  //   console.log("data changed", ...data);
  // }, [data]);

  return data;
}
