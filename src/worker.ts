import * as banner from "./functions/banner";

async function cacheRequest(
  event: FetchEvent,
  handle: (request: Request) => Promise<Response>
): Promise<Response> {
  const request = event.request;
  const url = new URL(request.url);

  const cacheKey = new Request(url.toString(), request);
  const cache = (caches as any).default as Cache;

  let response = await cache.match(cacheKey);

  if (!response) {
    response = await handle(request);

    response = new Response(response.body, response);

    response.headers.append('Cache-Control', 's-maxage=2678400'); // 31 days cache.
  
    event.waitUntil(cache.put(cacheKey, response.clone()));
  }

  return response;
}

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);

  const paths = url.pathname.split("/");
  paths.shift(); /* remove empty string */

  let response: Response;

  switch (paths[0]) {
    case "banner":
      try {
        response = await banner.handleRequest(request);
        break;
      } catch (error: any) {
        console.error(error);
        response = new Response(error.message, {
          status: 500,
          statusText: "Internal Server Error",
        });
      }

    default:
      response = new Response(`<h1>404: ${request.url}</h1>`, {
        status: 404,
        statusText: "Not Found",
        headers: {
          "Content-Type": "text/html",
        },
      });
  }

  return response;
}

addEventListener("fetch", (event: FetchEvent) => {
  event.respondWith(cacheRequest(event, handleRequest));
});
