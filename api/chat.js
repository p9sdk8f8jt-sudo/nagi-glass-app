import { runSike } from "../core/agent.js";

async function executeChat(body) {
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const history = Array.isArray(body?.history) ? body.history : [];
  if (!message) return { status: 400, payload: { error: "message is required" } };
  try {
    const result = await runSike({ message, history });
    return { status: 200, payload: { reply: result.reply, sources: result.sources || [], core: "sike-agent-v1" } };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Unexpected server error";
    const httpMatch = error.match(/HTTP (\\d{3})/);
    const upstreamStatus = httpMatch ? Number(httpMatch[1]) : null;
    const status = upstreamStatus && upstreamStatus >= 400 && upstreamStatus <= 599
      ? upstreamStatus
      : /OPENAI_API_KEYが設定されていません/.test(error)
        ? 500
        : 500;
    return { status, payload: { error } };
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const result = await executeChat(body);
  return Response.json(result.payload, { status: result.status });
}

// Vercel Node Functions require a default handler export for /api/*.js.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    let body = req.body;
    if (typeof body === "string") body = JSON.parse(body);
    const result = await executeChat(body || {});
    return res.status(result.status).json(result.payload);
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
}
