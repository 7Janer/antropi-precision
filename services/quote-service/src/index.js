import { randomBytes } from "node:crypto";
import { createServer } from "node:http";

const port = Number(process.env.PORT || 8083);
const validTiers = new Set(["standard", "pro", "ultra"]);

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 32_000) throw new Error("Request too large");
  }
  return JSON.parse(raw || "{}");
}

createServer(async (request, response) => {
  const url = new URL(request.url || "/", "http://quote-service");

  if (request.method === "GET" && url.pathname === "/health") {
    return sendJson(response, 200, { service: "quote-service", status: "ok" });
  }

  if (request.method !== "POST" || url.pathname !== "/quotes") {
    return sendJson(response, 404, { error: "Route not found" });
  }

  try {
    const body = await readJson(request);
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const quantity = Number(body.quantity);
    const tier = typeof body.tier === "string" ? body.tier : "";

    if (!email.includes("@") || !Number.isInteger(quantity) || quantity < 1 || !validTiers.has(tier)) {
      return sendJson(response, 400, {
        error: "A valid email, positive whole-number quantity and precision tier are required",
      });
    }

    const reference = `AR-${randomBytes(3).toString("hex").toUpperCase()}`;
    return sendJson(response, 202, {
      reference,
      status: "requirements-received",
      createdAt: new Date().toISOString(),
      nextStep: "Complete the secure CAD upload and manufacturability review.",
    });
  } catch {
    return sendJson(response, 400, { error: "Invalid request" });
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`quote-service listening on ${port}`);
});
