export async function POST(request) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!message) {
      return Response.json({ error: "message is required" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "Vercelの環境変数 OPENAI_API_KEY が設定されていません。" }, { status: 500 });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-6-luna",
        input: message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: `OpenAI APIエラー: ${data?.error?.message || "認証または権限を確認してください。"}` },
        { status: response.status }
      );
    }

    const reply =
      data?.output
        ?.flatMap(item => item?.content || [])
        ?.find(item => item?.type === "output_text")
        ?.text || "";

    return Response.json({ reply: reply || "返答を取得できなかったよ。" });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unexpected server error" },
      { status: 500 }
    );
  }
}
