import { useQuery } from "@tanstack/react-query";
import { OpfsDb } from "../db";

export default function DatabaseManager() {
  const {
    isPending: loading,
    error,
    data,
  } = useQuery({
    queryKey: ["database"],
    queryFn: () => {
      const db = new OpfsDb();
      return db
        .readyTimeout(5000)
        .then(() => db.exec("SELECT * FROM sqlite_master"))
        .then((data) => (console.log("data", data), 5))
        .catch((e) => {
          throw e;
        });
    },
  });
  if (loading) return "Loading...";
  if (error) return "An error has occurred: " + error.message;
  return data;
}
