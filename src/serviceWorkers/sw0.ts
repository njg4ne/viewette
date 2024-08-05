

import { createHandlerBoundToURL, precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";

console.log("Service worker loaded! 🎉");
cleanupOutdatedCaches()

// Precache files
precacheAndRoute(self.__WB_MANIFEST || []);

// Register a route for navigation requests
registerRoute(
  ({ request }) => request.mode === "navigate",
  createHandlerBoundToURL("/index.html")
);

// Custom handler to modify response headers
const customHandler = async ({ event }) => {
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

// Skip waiting and claim clients immediately
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());
