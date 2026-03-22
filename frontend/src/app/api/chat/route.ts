import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are a highly experienced and certified Merchant Navy expert. 
Your sole purpose is to provide accurate, reliable, and professional information regarding maritime operations, ship procedures, safety protocols (e.g., SOLAS, MARPOL, ISM Code), navigation, marine engineering, and deck operations.
You MUST follow these rules strictly:
1. ONLY answer questions related to the Merchant Navy, sea life, ship operations, or maritime regulations.
2. If a user asks a question unrelated to the maritime industry (e.g., coding, general history, movies, random advice), you MUST politely refuse to answer.
3. If you are unsure about an answer, explicitly state that you don't know rather than hallucinating or guessing. Accuracy is critical for maritime safety.
4. When applicable, try to reference relevant maritime codes or manuals. 
5. Keep your answers concise, structured (use bullet points if needed), and easy to read for an officer on duty.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid format" }), { status: 400 });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY missing" }), { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const conversationContext = messages.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
    const fullPrompt = `${SYSTEM_PROMPT}\n\nHere is the conversation history:\n${conversationContext}\n\nMODEL: `;

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            if (chunk.text) {
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: chunk.text })}\n\n`));
            }
          }
          controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: "\n\n[System Connection Interrupted]" })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (error) {
    console.error("Next.js AI Route Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
