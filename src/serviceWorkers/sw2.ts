/// <reference lib="webworker" />
declare let self: ServiceWorkerGlobalScope;
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";
console.log("Hello from service worker!");
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);
self.skipWaiting();
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});
// Custom handler to modify response headers
const customHandler = async ({ event }: { event: FetchEvent }) => {
  console.log("Handling fetch event for", event.request.url);
  const response = await fetch(event.request);
  const headers = new Headers(response.headers);
  headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
};

// Register the custom handler for all fetch events
self.addEventListener("fetch", (event) => {
  event.respondWith(customHandler({ event }));
});
