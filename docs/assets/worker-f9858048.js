
// console.log("Starting worker.js");

// async function opfs() {
//   const opfsRoot = await navigator.storage.getDirectory();
//   const fileHandle = await opfsRoot.getFileHandle("abc.txt", {
//     create: true,
//   });
//   // print all files in opfsRoot
//   for await (const entry of opfsRoot.values()) {
//     console.log("OPFS Root Contains: ", entry.name);
//   }

// }
// opfs();


if (crossOriginIsolated) {
  console.log("Using SharedArrayBuffer because Cross-Origin-Isolated is enabled");
  const buffer = new SharedArrayBuffer(16);
  // myWorker.postMessage(buffer);
} else {
  console.log("Using ArrayBuffer because Cross-Origin-Isolated is not enabled");
  const buffer = new ArrayBuffer(16);
  // myWorker.postMessage(buffer);
}


// self.onmessage = async function (msg) {
//   console.log(`Worker got the message: ${msg.data}`);
//   self.postMessage("Response from worker");
//   // const { query, blob } = msg.data;
//   // if (query && blob) {
//   //   const data = DB.exec(blob, query)
//   //   self.postMessage(data, [data.blob]);
//   // }
// };
// import initSqlJs from "sql.js";
// const SQL = await initSqlJs({
//   // Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
//   // You can omit locateFile completely when running in node
//   //   locateFile: (file) => `https://sql.js.org/dist/${file}`,
//   // ./node_modules/sql.js/dist/
//   locateFile: (file) => `./${file}`,
// });

// class DB {
//   // static async init(...args) {
//   //   const db = new SQL.Database();
//   //   const asset = db.export().buffer;
//   //   return { asset };
//   // }
//   // static async import(...args) {
//   //   const buff = new Uint8Array(args[0]);
//   //   const db = new SQL.Database(buff);
//   //   const asset = db.export().buffer;
//   //   return { asset };
//   // }
//   static exec(blob, query) {
//     const buff = new Uint8Array(blob);
//     const db = new SQL.Database(buff);
//     const result = db.exec(query);
//     blob = db.export().buffer;
//     return { blob, result };
//   }
// }



// self.onmessage = async function (msg) {
//   console.log("Worker got the message");
//   let asset = msg.data.asset;
//   console.log("asset arg", asset);
//   const work = DB[msg.data.cmd];
//   let error = null;
//   let rest = undefined;
//   if (work) {
//     let { asset } = await work(asset);
//   } else {
//     error = `Unknown command ${msg.data.cmd}`;
//   }
//   self.postMessage({ asset, error }, [asset]);
// };

// class OPFS {
//   static root = async () => await navigator.storage.getDirectory();
// }

// class DB {
//   static async init(...args) {
//     const db = new SQL.Database();
//     const asset = db.export().buffer;
//     return { asset };
//   }
//   static async import(...args) {
//     const buff = new Uint8Array(args[0]);
//     const db = new SQL.Database(buff);
//     const asset = db.export().buffer;
//     return { asset };
//   }
//   static async exec(...args) {
//     let [asset, query] = args;
//     const buff = new Uint8Array(asset);
//     const db = new SQL.Database(buff);
//     const result = db.exec(query);
//     asset = db.export().buffer;
//     return { asset, result };
//   }
// }

// // self.onmessage = async function (msg) {
// //   console.log("Worker got the message", msg);
// //   let { cmd, asset } = msg.data;
// //   console.log(`The desired command is "${cmd}"`);
// //   //   shared = await makeDbData();
// //   asset = await work();
// //   //   shared = shared.buffer;
// //   self.postMessage(asset, [asset]);
// // };

// // async function work() {
// //   const sum = new Array(30000000).fill(0).reduce((a, b) => a + b);
// //   return new ArrayBuffer(sum);
// // }

// async function makeDbData() {
//   // Create a database
//   const db = new SQL.Database();
//   // NOTE: You can also use new SQL.Database(data) where
//   // data is an Uint8Array representing an SQLite database file

//   // Execute a single SQL string that contains multiple statements
//   let sqlstr =
//     "CREATE TABLE hello (a int, b char); \
//     INSERT INTO hello VALUES (0, 'hello'); \
//     INSERT INTO hello VALUES (1, 'world');";
//   db.run(sqlstr); // Run the query without returning anything

//   // Prepare an sql statement
//   const stmt = db.prepare("SELECT * FROM hello WHERE a=:aval AND b=:bval");

//   // Bind values to the parameters and fetch the results of the query
//   const result = stmt.getAsObject({ ":aval": 1, ":bval": "world" });
//   console.log(result); // Will print {a:1, b:'world'}

//   // Bind other values
//   stmt.bind([0, "hello"]);
//   while (stmt.step()) console.log(stmt.get()); // Will print [0, 'hello']
//   // free the memory used by the statement
//   stmt.free();
//   // You can not use your statement anymore once it has been freed.
//   // But not freeing your statements causes memory leaks. You don't want that.

//   const res = db.exec("SELECT * FROM hello");
//   /*
//     [
//     {columns:['a','b'], values:[[0,'hello'],[1,'world']]}
//     ]
//     */

//   // You can also use JavaScript functions inside your SQL code
//   // Create the js function you need
//   function add(a, b) {
//     return a + b;
//   }
//   // Specifies the SQL function's name, the number of it's arguments, and the js function to use
//   db.create_function("add_js", add);
//   // Run a query in which the function is used
//   db.run("INSERT INTO hello VALUES (add_js(7, 3), add_js('Hello ', 'world'));"); // Inserts 10 and 'Hello world'

//   // You can create custom aggregation functions, by passing a name
//   // and a set of functions to `db.create_aggregate`:
//   //
//   // - an `init` function. This function receives no argument and returns
//   //   the initial value for the state of the aggregate function.
//   // - a `step` function. This function takes two arguments
//   //    - the current state of the aggregation
//   //    - a new value to aggregate to the state
//   //  It should return a new value for the state.
//   // - a `finalize` function. This function receives a state object, and
//   //   returns the final value of the aggregate. It can be omitted, in which case
//   //   the final value of the state will be returned directly by the aggregate function.
//   //
//   // Here is an example aggregation function, `json_agg`, which will collect all
//   // input values and return them as a JSON array:
//   db.create_aggregate("json_agg", {
//     init: () => [],
//     step: (state, val) => [...state, val],
//     finalize: (state) => JSON.stringify(state),
//   });

//   db.exec("SELECT json_agg(column1) FROM (VALUES ('hello'), ('world'))");
//   // -> The result of the query is the string '["hello","world"]'

//   // Export the database to an Uint8Array containing the SQLite database file
//   const binaryArray = db.export();
//   return binaryArray;
// }
