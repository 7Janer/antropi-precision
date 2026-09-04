import { createServer } from "node:http";

const port = Number(process.env.PORT || 8081);

const components = [
  {
    id: "bearing-housing",
    name: "Bearing housing",
    family: "Rotating assembly",
    overview:
      "Supports a bearing and keeps a shaft located under load. Bore geometry and its relationship to the mounting face usually control performance.",
    criticalFeatures: ["Bearing bore", "Mounting-face flatness", "Coaxiality"],
    suggestedTier: "pro",
  },
  {
    id: "motor-mount",
    name: "Motor mount",
    family: "Structural bracket",
    overview:
      "Locates a motor relative to a driven system while resisting vibration and maintaining shaft, coupling or belt alignment.",
    criticalFeatures: ["Hole-pattern position", "Face flatness", "Thread quality"],
    suggestedTier: "standard",
  },
  {
    id: "fluid-manifold",
    name: "Fluid manifold",
    family: "Flow control",
    overview:
      "Routes air or fluid through intersecting internal passages in a compact block. Sealing surfaces and clean cross-bores are common risks.",
    criticalFeatures: ["Sealing lands", "Port threads", "Cross-bore deburring"],
    suggestedTier: "pro",
  },
];

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, max-age=300",
  });
  response.end(JSON.stringify(body));
}

createServer((request, response) => {
  const url = new URL(request.url || "/", "http://component-service");

  if (request.method === "GET" && url.pathname === "/health") {
    return sendJson(response, 200, { service: "component-service", status: "ok" });
  }

  if (request.method === "GET" && url.pathname === "/components") {
    return sendJson(response, 200, { components });
  }

  if (request.method === "GET" && url.pathname.startsWith("/components/")) {
    const id = decodeURIComponent(url.pathname.slice("/components/".length));
    const component = components.find((item) => item.id === id);
    return component
      ? sendJson(response, 200, { component })
      : sendJson(response, 404, { error: "Component not found" });
  }

  return sendJson(response, 404, { error: "Route not found" });
}).listen(port, "0.0.0.0", () => {
  console.log(`component-service listening on ${port}`);
});
