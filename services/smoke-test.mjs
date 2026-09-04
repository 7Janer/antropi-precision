import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const root = new URL("../", import.meta.url);
const services = [
  "services/component-service/src/index.js",
  "services/ai-service/src/index.js",
  "services/quote-service/src/index.js",
  "services/api-gateway/src/index.js",
];

function startService(path) {
  const child = spawn(process.execPath, [path], {
    cwd: root,
    env: { ...process.env, GEMINI_API_KEY: "" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${path} did not start`)), 4_000);
    child.once("exit", (code) => reject(new Error(`${path} exited with ${code}`)));
    child.stdout.once("data", () => {
      clearTimeout(timer);
      resolve(child);
    });
    child.stderr.once("data", (data) => {
      clearTimeout(timer);
      reject(new Error(`${path}: ${data}`));
    });
  });
}

const children = [];

try {
  children.push(...(await Promise.all(services.map(startService))));

  const health = await fetch("http://127.0.0.1:8080/health").then((res) => res.json());
  assert.equal(health.status, "ok");

  const catalog = await fetch("http://127.0.0.1:8080/api/components").then((res) => res.json());
  assert.equal(catalog.components.length, 3);

  const explanation = await fetch("http://127.0.0.1:8080/api/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      componentId: "bearing-housing",
      question: "Why does bore alignment matter?",
    }),
  }).then((res) => res.json());
  assert.equal(explanation.source, "fallback");
  assert.match(explanation.answer, /bearing housing/i);

  const quoteResponse = await fetch("http://127.0.0.1:8080/api/quotes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "buyer@example.com", quantity: 25, tier: "pro" }),
  });
  const quote = await quoteResponse.json();
  assert.equal(quoteResponse.status, 202);
  assert.match(quote.reference, /^AR-[A-F0-9]{6}$/);

  console.log("Microservice smoke test passed: gateway, catalog, AI fallback and quote intake.");
} finally {
  for (const child of children) child.kill("SIGTERM");
}
