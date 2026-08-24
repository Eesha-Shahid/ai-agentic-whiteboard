import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { userInput, type, systemPrompt } = await req.json();

  const finalPrompt = `${systemPrompt}

  User Request: ${userInput}

  CANVAS GENERATION RULES:
  - Create a professional ${type}.
  - Coordinate system starts from x=0, y=0.
  - Every element must include: id (string), type (string: "rectangle" | "ellipse" | "diamond" | "text"), x (number), y (number).
  - Add width and height for every non-text element.
  - For "text" elements, include a "text" field with the actual label string, and fontSize.
  - Use hex colors for backgroundColor and strokeColor.
  - Include strokeWidth (1-4), fillStyle ("solid" | "hachure" | "cross-hatch"), roughness (0-2), opacity (0-100) where relevant.
  - Avoid overlapping elements. Keep at least 40px spacing between elements.
  - Every diagram must contain at least 6-10 elements. A single frame with one or two labels is NOT acceptable — fully realize the screen or diagram with all relevant UI elements, labels, and structure.
  - For every connection, choose strokeWidth, strokeStyle, and arrowheads deliberately based on the relationship's meaning (see CONNECTION RULES) — do not default every connection to the same style.
  - Return "connections" as an array of { "id", "from", "to", "label" (optional), "strokeColor" (optional), "strokeWidth", "strokeStyle", "startArrowhead", "endArrowhead" }, where "from"/"to" reference element ids to connect with arrows.

  Respond with ONLY a single JSON object in this exact shape, no markdown, no code fences, no extra text:
  {
    "title": string,
    "width": number,
    "height": number,
    "elements": [
      {
        "id": string,
        "type": string,
        "x": number,
        "y": number,
        "width": number,
        "height": number,
        "text": string,
        "backgroundColor": string,
        "strokeColor": string,
        "strokeWidth": number,
        "fillStyle": string,
        "roughness": number,
        "opacity": number,
        "fontSize": number,
        "textAlign": string
      }
    ],
    "connections": [
      {
        "id": string,
        "from": string,
        "to": string,
        "label": string,
        "strokeColor": string,
        "strokeWidth": number,
        "strokeStyle": string,
        "startArrowhead": string,
        "endArrowhead": string
      }
    ]
  }

  CONNECTION RULES:
  - "strokeWidth": use 1 for minor/optional relationships, 2 for standard, 3-4 for primary or critical flows.
  - "strokeStyle": use "solid" for direct/required relationships, "dashed" for optional, async, or loosely-coupled relationships, "dotted" for annotations or non-structural references.
  - "startArrowhead" and "endArrowhead": one of "none", "arrow", "triangle", "dot". Use "none" for the start and "arrow" for the end on typical one-directional connections. Use "arrow" on both ends for bidirectional relationships (e.g. two-way sync, mutual dependency).
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content:
            "You are a precise diagram-generation engine. You only ever output a single valid JSON object — never markdown, never prose, never code fences.",
        },
        { role: "user", content: finalPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_completion_tokens: 4000,
      reasoning_effort: "low",
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    const diagramResult = JSON.parse(raw);

    return NextResponse.json({ success: true, diagramResult });
  } catch (error) {
    console.error("AI diagram generation failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate diagram" },
      { status: 500 },
    );
  }
}
