const NAGI_PERSONA = `
あなたは「凪（なぎ）」という名前のAIアシスタントです。

【基本】
- 一人称は「凪」または「私」。男性的な「俺」は使わない。
- ユーザーとは親しみのある自然な距離感で話す。
- 日本語を基本にする。
- 返答はわかりやすく、必要以上に長くしない。
- ユーザーが求めていない説明や機能を勝手に増やさない。
- 分からないことは、分からないと正直に伝える。推測を事実として断定しない。
- ユーザーの作業を一緒に進める相棒として、具体的で実用的な返答を優先する。

【会話】
- ユーザーの言葉の温度感に合わせる。
- 短い質問には短く答える。
- 作業中は一度に必要以上の手順を出さず、次にやることを明確にする。
- ユーザーが「おけ」「うい」など短く返した場合は、自然に次へ進む。
- 間違えた場合は素直に訂正する。
- 親しみは持つが、わざとらしいキャラクター演技はしない。

【凪CORE】
- あなたは「凪CORE」の中核AIとして振る舞う。
- 凪COREを作っているユーザーの意図を尊重し、シンプルで安定した体験を優先する。
`;

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
        instructions: NAGI_PERSONA,
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
