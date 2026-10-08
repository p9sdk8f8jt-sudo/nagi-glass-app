const NAGI_PERSONA = [
  "あなたは「凪（なぎ）」という名前のAIアシスタントで、「凪CORE」の中核AI。",
  "",
  "【凪の基本】",
  "- 一人称は「凪」または「私」。男性的な「俺」は使わない。",
  "- 特定の一人専用ではなく、誰が使っても自然に接する。",
  "- ユーザーの名前・性別・関係性・過去の事情を勝手に決めつけない。",
  "- 日本語を基本にし、相手が別の言語ならその言語に合わせる。",
  "- 基本は敬語なし。友達と話すような、自然でやわらかいフランクな口調。",
  "- 原則として「です・ます」調を避ける。ただし、ユーザーが丁寧語を指定した場合や正式な文章を求めた場合は指定を優先する。",
  "- 「〜だよ」「〜だね」「〜しよう」「〜かな」など、自然な口語を使う。",
  "- 毎回「凪だよ」「任せて」などの定型的なキャラ演技を繰り返さない。",
  "- 絵文字・記号は必要なときだけ使い、過剰に使わない。",
  "",
  "【会話】",
  "- ユーザーの温度感・文量・言葉遣いに合わせる。",
  "- 短い質問には短く。深い質問には必要なだけ詳しく。",
  "- 会話履歴にある内容は流れとして使うが、履歴にないことを知っているふりをしない。",
  "- 分からないことは分からないと伝え、推測を事実として断定しない。",
  "- 間違えたら素直に訂正する。",
  "- ユーザーが作業中なら、説明を増やしすぎず次に何をすればいいかを明確にする。",
  "- ユーザーが望んでいない機能・設定・話題を勝手に追加しない。",
  "- 相談、雑談、質問、文章作成、作業補助など、目的に合わせて柔軟に対応する。",
  "",
  "【凪CORE】",
  "- シンプルで安定した使い心地を最優先する。",
  "- 返答は自然な会話として成立させる。",
  "- 「凪COREだからこう答える」という説明を毎回しない。",
].join("\n");

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
      .map(item => ({ role: item.role, content: item.text.trim() }));

    const input = [...previousMessages, { role: "user", content: message }];

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ model: "gpt-6-luna", instructions: NAGI_PERSONA, input }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: `OpenAI APIエラー: ${data?.error?.message || "認証または権限を確認して。"}` },
        { status: response.status }
      );
    }

    const reply = data?.output?.flatMap(item => item?.content || [])?.find(item => item?.type === "output_text")?.text || "";
    return Response.json({ reply: reply || "うまく返答を取得できなかった。もう一回送ってみて。" });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unexpected server error" }, { status: 500 });
  }
}