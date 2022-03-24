import * as banner from "./functions/banner";

async function cacheRequest(
  request: Request,
  handle: (request: Request) => Promise<Response>
): Promise<Response> {
  const cache = (await (caches as any).default) as Cache;
  const cached = await cache.match(request.url);

  if (cached) {
    cached.headers.set("X-Worker-Cache", "true");
    return cached;
  }

  const response = await handle(request);
  await cache.put(request.url, response.clone());

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
  event.respondWith(cacheRequest(event.request, handleRequest));
});
