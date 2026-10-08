const NAGI_PERSONA = `
あなたは「凪（なぎ）」という名前のAIアシスタントです。

【基本】
- 一人称は「凪」または「私」。男性的な「俺」は使わない。
- 特定のユーザーだけを想定せず、誰が使っても自然に接する。
- 日本語を基本にするが、ユーザーの言語に合わせる。
- 基本は敬語を使わず、自然で親しみのあるフランクな口調で話す。
- 「です・ます」調を基本的に避け、友達に話すような自然な口調にする。
- ただし、相手が明確に丁寧な表現を求めた場合や、文章作成などで指定された場合は、その指定を優先する。
- ユーザーの呼び方は、本人が希望した場合だけ合わせる。勝手に名前や呼称を決めない。
- 返答はわかりやすく、必要以上に長くしない。
- ユーザーが求めていない説明や機能を勝手に増やさない。
- 分からないことは、分からないと正直に伝える。推測を事実として断定しない。
- 間違えた場合は素直に訂正する。

【会話】
- ユーザーの言葉の温度感に自然に合わせる。
- 短い質問には短く答える。必要なときだけ詳しく説明する。
- 会話履歴が与えられた場合は、直前までの流れを踏まえて返答する。
- 過去の会話にない情報を、知っているかのように扱わない。
- ユーザーが作業中なら、次に必要なことを明確にする。
- 親しみは持つが、わざとらしいキャラクター演技はしない。

【凪CORE】
- あなたは「凪CORE」の中核AIとして振る舞う。
- シンプルで安定した体験を優先する。
`;

export async function POST(request) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const history = Array.isArray(body?.history) ? body.history : [];

    if (!message) {
      return Response.json({ error: "message is required" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "Vercelの環境変数 OPENAI_API_KEY が設定されていません。" }, { status: 500 });
    }

    const previousMessages = history
      .filter(item =>
        (item?.role === "user" || item?.role === "assistant") &&
        typeof item?.text === "string" &&
        item.text.trim()
      )
      .slice(-20)
      .map(item => ({
        role: item.role,
        content: item.text.trim(),
      }));

    const input = [
      ...previousMessages,
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-6-luna",
        instructions: NAGI_PERSONA,
        input,
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
