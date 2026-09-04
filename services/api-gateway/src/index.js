import { createServer } from "node:http";

const port = Number(process.env.PORT || 8080);
const allowedOrigin = process.env.ALLOWED_ORIGIN || "http://localhost:3000";

const routes = [
  {
    prefix: "/api/components",
    target: process.env.COMPONENT_SERVICE_URL || "http://localhost:8081",
    targetPrefix: "/components",
  },
  {
    prefix: "/api/explain",
    target: process.env.AI_SERVICE_URL || "http://localhost:8082",
    targetPrefix: "/explain",
  },
  {
    prefix: "/api/quotes",
    target: process.env.QUOTE_SERVICE_URL || "http://localhost:8083",
    targetPrefix: "/quotes",
  },
];

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    Vary: "Origin",
  };
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    ...corsHeaders(),
  });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 64_000) throw new Error("Request too large");
    chunks.push(chunk);
  }
  return chunks.length ? Buffer.concat(chunks) : undefined;
}

createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(204, corsHeaders());
    return response.end();
  }

  const requestUrl = new URL(request.url || "/", "http://api-gateway");

  if (request.method === "GET" && requestUrl.pathname === "/health") {
    return sendJson(response, 200, { service: "api-gateway", status: "ok" });
  }

  const route = routes.find((item) => requestUrl.pathname.startsWith(item.prefix));
  if (!route) return sendJson(response, 404, { error: "Route not found" });

  try {
    const suffix = requestUrl.pathname.slice(route.prefix.length);
    const targetUrl = new URL(`${route.targetPrefix}${suffix}${requestUrl.search}`, route.target);
    const body = request.method === "GET" ? undefined : await readBody(request);
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers: request.headers["content-type"]
        ? { "Content-Type": request.headers["content-type"] }
        : undefined,
      body,
      signal: AbortSignal.timeout(10_000),
    });

    response.writeHead(upstream.status, {
      "Content-Type": upstream.headers.get("content-type") || "application/json; charset=utf-8",
      "Cache-Control": upstream.headers.get("cache-control") || "no-store",
      ...corsHeaders(),
    });
    response.end(Buffer.from(await upstream.arrayBuffer()));
  } catch {
    return sendJson(response, 503, {
      error: "The requested service is temporarily unavailable",
    });
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`api-gateway listening on ${port}`);
});
