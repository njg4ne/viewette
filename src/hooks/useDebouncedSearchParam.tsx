import { useDebouncedCallback } from "use-debounce";
import { useSearchParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "preact/hooks";

export default function useDebouncedSearchParam({
  delay,
  key,
  // value,
  // onDelayEnd,
  replace,
}: {
  delay?: number;
  replace?: boolean;
  key: string;
  // onDelayEnd?: (value: string) => any;
}) {
  delay = delay || 500;
  if (replace === undefined) {
    replace = true;
  }

  const [searchParams, setSearchParams] = useSearchParams();
  // const param = searchParams.get(key) || "";
  const param = useMemo(() => searchParams.get(key) || "", [searchParams, key]);

  const ssp = (value: string) => {
    // setLoading(true);
    setSearchParams(
      (sp) => {
        if (value === "") {
          sp.delete(key);
        } else {
          sp.set(key, value);
        }
        return sp;
      },
      { replace }
    );
  };
  const debounced = useDebouncedCallback(ssp, delay);
  const onChangeFn = (which: string) => (value: string) => {
    const run = which === "immediate" ? ssp : debounced;
    run(value);
  };
  return [
    param,
    onChangeFn("debounced"),
    onChangeFn("immediate"),
    param
    // loading,
  ] as const;
}

// function useDebouncedSearchParam1({
//   delay,
//   key,
//   // value,
//   onDelayEnd,
//   replace,
// }: {
//   delay?: number;
//   replace?: boolean;
//   key: string;
//   onDelayEnd?: (value: string) => any;
// }) {
//   delay = delay || 400;
//   if (replace === undefined) {
//     replace = true;
//   }

//   const [searchParams, setSearchParams] = useSearchParams();
//   const param = searchParams.get(key) || "";
//   const callback = (value: string) => {
//     setSearchParams(
//       (sp) => {
//         if (value === "") {
//           sp.delete(key);
//         } else {
//           sp.set(key, value);
//         }
//         return sp;
//       },
//       { replace }
//     );
//   };
//   const debounced = useDebouncedCallback(callback, delay);
//   const onChangeFn = (which: string) => (value: string) => {
//     const run = which === "immediate" ? callback : debounced;
//     run(value);
//     if (onDelayEnd) {
//       onDelayEnd(value);
//     }
//   };
//   return [param, onChangeFn("debounced"), onChangeFn("immediate")] as const;
// }
