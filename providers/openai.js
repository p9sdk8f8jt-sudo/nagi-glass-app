export async function createOpenAIResponse({ model, instructions, input, webSearch, maxOutputTokens }) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEYが設定されていません。VercelのEnvironment Variablesを確認してください。");
  }

  const tools = webSearch ? [{ type: "web_search" }] : [];
  let response;
  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        instructions,
        input,
        tools,
        tool_choice: "auto",
        max_output_tokens: maxOutputTokens,
      }),
    });
  } catch (error) {
    throw new Error(`OpenAIへの通信に失敗しました: ${error instanceof Error ? error.message : "network error"}`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`OpenAIからJSONではない応答が返りました (HTTP ${response.status}, request_id: ${response.headers.get("x-request-id") || "unknown"})`);
  }

  const requestId = response.headers.get("x-request-id") || data?.id || "unknown";
  if (!response.ok) {
    const apiMessage = data?.error?.message || "詳細不明のOpenAI APIエラー";
    const apiCode = data?.error?.code || data?.error?.type || "unknown";
    if (response.status === 429 || /rate_limit/i.test(String(apiCode))) {
      const retryMatch = apiMessage.match(/try again in ([\dhms.]+)/i);
      const retryText = retryMatch ? ` 再試行の目安：${retryMatch[1]}。` : " 少し時間をおいてから再試行してね。";
      const tpmHint = /tokens per min|\bTPM\b/i.test(apiMessage)
        ? "会話履歴と回答量を抑える設定に見直したよ。"
        : "短時間にリクエストが集中していないか確認してね。";
      throw new Error(`OpenAI APIの一時的な利用制限に達したよ。${tpmHint}${retryText}（request_id: ${requestId}）`);
    }
    throw new Error(`OpenAI APIエラー (HTTP ${response.status}, code: ${apiCode}, request_id: ${requestId}): ${apiMessage}`);
  }

  // Prefer the SDK-style convenience field, but also read text directly from
  // Responses API output items in case output_text is absent.
  let reply = typeof data?.output_text === "string" ? data.output_text.trim() : "";
  if (!reply) {
    const textParts = [];
    for (const item of Array.isArray(data?.output) ? data.output : []) {
      if (item?.type === "message" && Array.isArray(item.content)) {
        for (const content of item.content) {
          if ((content?.type === "output_text" || content?.type === "text") && typeof content.text === "string") {
            textParts.push(content.text);
          }
        }
      }
    }
    reply = textParts.join("\n").trim();
  }

  if (!reply) {
    const outputTypes = (Array.isArray(data?.output) ? data.output : [])
      .map(item => item?.type || "unknown")
      .join(",") || "none";
    const reason = data?.incomplete_details?.reason || "none";
    throw new Error(`OpenAI応答に本文がありません (status: ${data?.status || "unknown"}, output_types: ${outputTypes}, incomplete_reason: ${reason}, request_id: ${requestId})`);
  }

  const sources = [];
  for (const item of Array.isArray(data?.output) ? data.output : []) {
    for (const content of Array.isArray(item?.content) ? item.content : []) {
      for (const annotation of Array.isArray(content?.annotations) ? content.annotations : []) {
        if (annotation?.type === "url_citation" && annotation?.url) {
          const exists = sources.some(source => source.url === annotation.url);
          if (!exists) sources.push({
            title: annotation.title || annotation.url,
            url: annotation.url,
          });
        }
      }
    }
  }

  return { reply, sources };
}
