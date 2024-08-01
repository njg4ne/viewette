// import { Sqlite3Static } from "@sqlite.org/sqlite-wasm";
type AllParametersButLast<T extends any[]> = T extends [...infer U, any]
  ? U
  : never;
// SQLite3Error;
namespace SQLite3 {
  namespace Worker1 {
    // type Command = "open" | "close" | "config-get" | "exec" | "export";
    type Promiser = (
      command: Command,
      config: Record<string, any>
    ) => Promise<any>;
    type Result = {
      resultRows: any[] | null;
    };
    namespace Request {
      type Bindings = Record<string, any>;
    }
    namespace Result {
      type RowMode = "array" | "object";
    }
    type Error = {
      result: {
        message: string;
      };
    };
    type Response = {
      dbId: string;
      departureTime: number;
      messageId: string;
      result: SQLite3.Worker1.Result;
      type: Command;
      workerReceivedTime: number;
      workerRespondTime: number;
    };
  }
  namespace Delegate {
    type Executor = (
      sql: string,
      rowMode?: "array" | "object",
      bindings?: Record<string, any>
    ) => Promise<SQLite3.Worker1.Response>;
    type Transactor = (
      ...args: Parameters<Executor>
    ) => Promise<SQLite3.Worker1.Response>;
  }
}

// type Command = "open" | "close" | "config-get" | "exec" | "export";

// type Promiser = (command: Command, config: Record<string, any>) => Promise<any>;

// type SqliteResult = {
//   resultRows: any[] | null;
// };
// type SqliteError = {
//   result: {
//     message: string;
//   };
// };
