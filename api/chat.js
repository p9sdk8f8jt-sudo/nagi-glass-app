import { runSike } from "../core/agent.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const history = Array.isArray(body?.history) ? body.history : [];

    if (!message) {
      return Response.json({ error: "message is required" }, { status: 400 });
    }

    const result = await runSike({ message, history });
    return Response.json({
      reply: result.reply,
      sources: result.sources || [],
      core: "sike-agent-v1",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unexpected server error";
    const status = /API|OPENAI|rate limit|quota|authentication|permission/i.test(message) ? 429 : 500;
    return Response.json({ error: message }, { status });
  }
}
