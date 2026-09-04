import { createServer } from "node:http";

const port = Number(process.env.PORT || 8082);
const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

const knowledge = {
  "bearing-housing": {
    name: "bearing housing",
    context:
      "It supports a rolling bearing and locates a rotating shaft. Key risks are bearing-bore size and roundness, bore-to-face alignment, mounting-face flatness, coaxiality and the drawing's specified fit.",
    fallback:
      "A bearing housing holds the bearing that supports a rotating shaft. The difficult features are usually the bearing bore, the mounting face and their geometric relationship: a bore can be the right diameter and still cause vibration if it is not round, square or aligned. Production commonly combines milling, precision boring or reaming, stable workholding and a controlled finishing pass. Inspect bore size, roundness, coaxiality, mounting-face flatness and the fit defined on the engineering drawing. A Pro-level process may suit critical bearing features, while the drawing controls the final precision tier.",
  },
  "motor-mount": {
    name: "motor mount",
    context:
      "It supports and locates a motor while maintaining shaft, coupling or belt alignment. Key risks are hole position, face flatness, stiffness, thread quality and distortion in thin sections.",
    fallback:
      "A motor mount fixes a motor to an assembly and preserves the alignment needed to transfer motion cleanly. The main challenge is often relational rather than very small dimensions: the hole pattern, locating features and motor face must line up so the coupling or belt does not run under stress. A typical route is CNC milling, drilling and threading, followed by deburring and finish treatment. Inspect hole position, face flatness, perpendicularity, thread quality and the datum features on the drawing. Standard precision is often sufficient for a robust bracket; critical alignment features may justify a tighter tier.",
  },
  "fluid-manifold": {
    name: "fluid manifold",
    context:
      "It routes oil, coolant, vacuum or compressed air through intersecting passages. Key risks are sealing surfaces, port threads, cross-bore position, internal burrs, wall thickness, pressure integrity and cleanliness.",
    fallback:
      "A fluid manifold replaces many tubes and fittings with passages machined into one compact block. That simplifies the final assembly, but intersecting bores and sealing interfaces make the part demanding. Production often combines multi-face milling, deep drilling, thread making, controlled deburring and cleaning. Inspect port position, thread gauges, sealing-land flatness, passage connectivity, remaining wall thickness and any pressure or leak requirement on the drawing. Pro precision is a practical starting point for sealing and flow-control features, while non-critical exterior geometry can remain more economical.",
  },
};

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

async function askGemini(component, question) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/interactions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        model,
        input: [
          "You are the Antropi Robotics CNC component guide.",
          "Explain function, machining risk and inspection priorities in plain English.",
          "Do not invent certifications, prices, lead times or guaranteed tolerances.",
          "Keep the answer to 110-150 words and use one paragraph with no markdown heading.",
          `Component context: ${component.context}`,
          `Customer question: ${question}`,
        ].join("\n"),
      }),
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) return null;
  const payload = await response.json();
  return typeof payload.output_text === "string" ? payload.output_text.trim() : null;
}

createServer(async (request, response) => {
  const url = new URL(request.url || "/", "http://ai-service");

  if (request.method === "GET" && url.pathname === "/health") {
    return sendJson(response, 200, {
      service: "ai-service",
      status: "ok",
      provider: process.env.GEMINI_API_KEY ? "gemini-ready" : "fallback-ready",
    });
  }

  if (request.method !== "POST" || url.pathname !== "/explain") {
    return sendJson(response, 404, { error: "Route not found" });
  }

  try {
    const body = await readJson(request);
    const component = knowledge[body.componentId];
    if (!component) return sendJson(response, 400, { error: "Unknown CNC component" });

    const question =
      typeof body.question === "string" && body.question.trim()
        ? body.question.trim().slice(0, 280)
        : `Explain this ${component.name}.`;

    let answer = null;
    try {
      answer = await askGemini(component, question);
    } catch {
      answer = null;
    }

    return sendJson(response, 200, {
      answer: answer || component.fallback,
      source: answer ? "gemini" : "fallback",
    });
  } catch {
    return sendJson(response, 400, { error: "Invalid request" });
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`ai-service listening on ${port}`);
});
