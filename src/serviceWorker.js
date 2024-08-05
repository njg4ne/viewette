import { cleanupOutdatedCaches, precache, addRoute, precacheAndRoute, } from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";
import {cacheNames} from "workbox-core";


let manifest = self.__WB_MANIFEST;

// console.log("WB Manifest: ", ...manifest);
const base = {revision: null, url: "/"}
// set all revision to null
manifest = [...manifest, base].map((item) => {
  item.revision = null;
  return item;
});
precache(manifest); //Adds items to the precache list, removing any duplicates and stores the files in the workbox-core.cacheNames "precache cache" when the service worker installs.

// find the manifest option that is index.html

// manifest.forEach(async ({url:urlPath}) => {
//   // try fetching the asset
//   let response = await fetch(urlPath);
//   console.log(`URL: ${urlPath} - Status: ${response.status}, Response: `, response);
// });





cleanupOutdatedCaches();

self.skipWaiting();

clientsClaim();

function addHeaders(response) {
  let { status, statusText, headers, body } = response;
  headers = new Headers(headers);
  headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  // headers.set("abcdefg", "abcdefg");
  return new Response(body, { status, statusText, headers });
}

registerRoute(
  ({ url }) => url.pathname.startsWith("/service-worker/health"),
  async () => {
    console.log("health check invoked");
    return new Response("OK", {
      headers: { "Content-Type": "text/plain" },
    });
  }
);

const tags = [
  { id: 1, path: "acceleration", description: "Usage mode for going faster." },
];
registerRoute(
  ({ url }) => url.pathname === "/api/collections/tags",
  async () => {
    return new Response(JSON.stringify(tags), {
      headers: { "Content-Type": "application/json", abcdefg: "abcdefg" },
    });
  }
);

// handle all /api routes and forward them over the broadcast channel for api
// const isApiRequest = ({ url }) => url.pathname.startsWith("/api/");
// registerRoute(isApiRequest, async ({ request }) => {
//   const channel = new BroadcastChannel("api-messages");
//   // add an event listener to the channel for response, but timeout after 750ms 
//   // if no response is received
//   const endpoint = new URL(request.url).pathname;
//   channel.postMessage({ endpoint  });
//   return await new Promise((resolve, reject) => {
//     channel.addEventListener("message", (event) => {
//       const data = event.data;
//       console.log("SW got back data: ", data);
//       const response = new Response(JSON.stringify(data), {
//         headers: { "Content-Type": "application/json" },
//       });
//       console.log("Resolving response: ", response);
//       resolve(response);
//     });
//     setTimeout(() => {
//       reject(new Error("Timeout"));
//     }, 5000);
//   });
// });


// function matchCallback({ url, sameOrigin, request, event }) {
//   const notApiCall = !url.pathname.startsWith("/api/");
//   return notApiCall;
// }

function getCacheStrategy(cacheName) {
  return new CacheFirst({
    cacheName,
    plugins: [
      {
        handlerWillRespond: async ({ response }) => {
          
          return addHeaders(response);
        },
      },
    ],
  });
}


registerRoute(() => true, getCacheStrategy(cacheNames.precache));






