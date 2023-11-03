import * as React from 'react';

const contextValueFormat = {}
const WorkContext = React.createContext(contextValueFormat);

export const useWorker = () => React.useContext(WorkContext);
// export const listenToWorker = (callback) => {
//     const worker = React.useContext(WorkContext);
//     worker.addEventListener('message', callback);
// }
export function WorkerProvider({ children }) {
    let worker = new Worker("worker.js", { type: 'module' });
    // let worker = new Worker("worker.sql-wasm.js");
    worker.onmessage = (msg) => {
        console.log("Message from worker:", msg.data);
    }

    // worker.postMessage({
    //     id: 2,
    //     action: "export",
    // });
    React.useEffect(() => {
        return () => {
            worker.terminate();
        }
    }, []);

    return (
        <WorkContext.Provider value={worker}>
            {children}
        </WorkContext.Provider>
    );
}

async function sqlExec(dbHandle, query) {
    if (!dbHandle || !dbHandle.getFile) {
        throw new Error("The provided database handle is invalid.");
    }
    const worker = useWorker();
    const file = await dbHandle.getFile();
    const blob = await file.arrayBuffer();
    const data = {
        blob,
        query
    }
    const blobPromise = new Promise((resolve, reject) => {
        // listenToWorker((msg) => {
        //     resolve(msg.data);
        // });
        setTimeout(() => reject(new Error("Worker took too long")), 5000);
    });
    worker.postMessage(data, [blob]);
    return await blobPromise;
}

//
// let w = new Worker(new URL("./worker.js", import.meta.url), {
//   type: "module",
// });
// w.onmessage = msgHandler;

//   function initDb() {
//     let arr = new Uint8Array([1, 2, 3]);
//     arr = arr.buffer;
//     console.log("Contacting worker");
//     w.postMessage({ cmd: "init", asset: arr }, [arr]);
//   }
//   async function importDb() {
//     if (!dbHandle || !dbHandle.getFile) {
//       console.log("No dbHandle");
//       return;
//     }
//     // get the contents of the file as a Blob
//     const file = await dbHandle.getFile();
//     const asset = await file.arrayBuffer();
//     console.log("Sending blob to worker of size", asset.byteLength);
//     console.log("asset", asset);
//     w.postMessage({ cmd: "import", asset: asset }, [asset]);
//   }


// useEffect(() => {
//   // console.log("Hello from homepage before work");
//   if (window.Worker && !w) {
//     // make module worker
//     console.log("Creating local worker");
//     w = new Worker(new URL("./worker.js", import.meta.url), {
//       type: "module",
//     });
//     w.onmessage = msgHandler;
//   }
// }, []);

//

