import { useQuery } from "@tanstack/react-query";
import { OpfsDb } from "../db";
import { useEffect, useState } from "preact/hooks";
import init from "../db/init.sql?raw";
import { useOpfsDbContext } from "../contexts/OpfsDbContext";

export default function DatabaseManager() {
  const db = useOpfsDbContext();
  const [data, setData] = useState([]);
  useEffect(() => {
    if (db) {
      db.readyTimeout(1000)
        .then(() => db.exec(init))
        .then(() => db.exec("SELECT * FROM tags"))
        .then((data) => {
          const rows = data?.result?.resultRows || [];
          setData(rows as any);
        });
    }
  }, [db]);

  return (
    <table>
      <thead>
        <tr>
          <th>id</th>
          <th>path</th>
          <th>description</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr>
            <td>{row[0]}</td>
            <td>{row[1]}</td>
            <td>{row[2]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// async function checkServiceWorkerHealth() {
//   // const localStorageKey =
//   //   "service-worker-installation-watchdog-attempt-counter";
//   // let attemptCount = parseInt(localStorage.getItem(localStorageKey) || "0", 10);
//   const endpoint = "/service-worker/health";
//   const response = await fetch(endpoint);
//   const contentType = response.headers.get("content-type");
//   if (contentType === "text/plain") {
//     const text = await response.text();
//     // localStorage.removeItem(localStorageKey);
//     return text;
//   }
//   return "Unhealthy";
// }
