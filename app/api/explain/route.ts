import { NextResponse } from "next/server";

type ComponentId = "bearing-housing" | "motor-mount" | "fluid-manifold";

const COMPONENTS: Record<
  ComponentId,
  { name: string; context: string; fallback: string }
> = {
  "bearing-housing": {
    name: "bearing housing",
    context:
      "A bearing housing supports a rolling bearing and locates a rotating shaft. Important manufacturing concerns include bearing-bore size and roundness, bore-to-face alignment, mounting-face flatness, coaxiality and the transition fits specified on the engineering drawing.",
    fallback:
      "A bearing housing holds the bearing that supports a rotating shaft. Its main job is to keep that shaft correctly located under load. The difficult features are usually the bearing bore, the mounting face and their relationship to one another: a bore can be the right diameter and still cause vibration if it is not round, square or aligned. Machining normally combines milling, boring or reaming, careful workholding and a controlled finishing pass. Inspection should prioritise bore size, roundness, coaxiality, mounting-face flatness and the drawingâ€™s specified fit. A Pro-level process may suit critical bearing features, but the drawing always decides the final tier.",
  },

  "motor-mount": {
    name: "motor mount",
    context:
      "A motor mount locates and supports a motor while maintaining shaft, coupling or belt alignment. Important concerns include hole-pattern position, mounting-face flatness, stiffness, thread integrity, access for tools and avoiding distortion in thin sections.",
    fallback:
      "A motor mount fixes a motor to the rest of an assembly and preserves the alignment needed to transfer motion cleanly. Its risk is often relational rather than tiny size alone: the hole pattern, locating features and motor face must line up so the coupling or belt does not run under stress. A typical route is CNC milling, drilling and threading, followed by deburring and finish treatment. Inspection should focus on hole position, face flatness, perpendicularity, thread quality and any datum features called out on the drawing. Standard precision is often enough for a robust bracket; critical alignment features may justify a tighter tier.",
  },

  "fluid-manifold": {
    name: "fluid manifold",
    context:
      "A fluid manifold routes hydraulic oil, coolant, fuel, vacuum or compressed air through internal intersecting passages. Important concerns include sealing surfaces, port-thread quality, cross-bore location, removal of internal burrs, wall thickness, pressure integrity and cleanliness.",
    fallback:
      "A fluid manifold replaces many separate tubes and fittings with passages machined into one compact block. That simplifies an assembly, but intersecting bores and sealing interfaces make the part demanding. Manufacturing often combines multi-face milling, deep drilling, thread making, controlled deburring and cleaning. Inspection should prioritise port position, thread gauges, sealing-land flatness, passage connectivity, remaining wall thickness and any pressure or leak requirement on the drawing. Pro precision is a useful starting point for sealing and flow-control features, while non-critical exterior geometry can usually stay more economical.",
  },
};

function isComponentId(value: unknown): value is ComponentId {
  return typeof value === "string" && value in COMPONENTS;
}

function fallbackResponse(componentId: ComponentId) {
  return NextResponse.json({
    answer: COMPONENTS[componentId].fallback,
    source: "fallback" as const,
  });
}

type GeminiPayload = {
  output_text?: unknown;
  steps?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: unknown;
    }>;
  }>;
};

export async function POST(request: Request) {
  let body: { componentId?: unknown; question?: unknown };

  try {
    body = (await request.json()) as {
      componentId?: unknown;
      question?: unknown;
    };
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!isComponentId(body.componentId)) {
    return NextResponse.json(
      { error: "Unknown CNC component" },
      { status: 400 }
    );
  }

  const component = COMPONENTS[body.componentId];

  const question =
    typeof body.question === "string"
      ? body.question.trim().slice(0, 280)
      : `Explain this ${component.name}.`;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("GEMINI_API_KEY is missing");
    return fallbackResponse(body.componentId);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
          generation_config: {
            thinking_level: "low",
          },
          input: [
            "You are the Antropi Robotics CNC component guide.",
            "Answer a potential manufacturing customer in plain English.",
            "Be accurate, concise and practical.",
            "Explain function, machining risk and inspection priorities when relevant.",
            "Do not invent certifications, prices, lead times or guaranteed tolerances.",
            "State that the engineering drawing controls the final manufacturing decision when needed.",
            `Component context: ${component.context}`,
            `Customer question: ${question || `Explain this ${component.name}.`}`,
            "Respond in one clear paragraph of 110 to 150 words. Do not use markdown headings.",
          ].join("\n"),
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Gemini API error:",
        response.status,
        errorText
      );

      return fallbackResponse(body.componentId);
    }

    const payload = (await response.json()) as GeminiPayload;

    // SDK-style response, kept for compatibility
    const directAnswer =
      typeof payload.output_text === "string"
        ? payload.output_text.trim()
        : "";

    // Raw REST Interactions API response
    const stepsAnswer =
      payload.steps
        ?.filter((step) => step.type === "model_output")
        .flatMap((step) => step.content ?? [])
        .filter(
          (item) =>
            item.type === "text" &&
            typeof item.text === "string"
        )
        .map((item) => item.text as string)
        .join("\n")
        .trim() ?? "";

    const answer = directAnswer || stepsAnswer;

    if (!answer) {
      console.error(
        "Gemini returned no usable text:",
        JSON.stringify(payload)
      );

      return fallbackResponse(body.componentId);
    }

    return NextResponse.json({
      answer,
      source: "gemini" as const,
    });

  } catch (error) {
    console.error("Gemini request failed:", error);

    return fallbackResponse(body.componentId);
  } finally {
    clearTimeout(timeout);
  }
}