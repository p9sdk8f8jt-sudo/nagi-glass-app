export async function createOpenAIResponse({ model, instructions, input, webSearch, maxOutputTokens }) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEYが設定されていません。");
  }

  const tools = webSearch ? [{ type: "web_search" }] : [];

  const response = await fetch("https://api.openai.com/v1/responses", {
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "OpenAI APIエラー");
  }

  const reply = data?.output_text || "";
  const sources = [];

  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      for (const annotation of content?.annotations || []) {
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

  return { reply: reply || "うまく返答を取得できなかった。もう一回送ってみて。", sources };
}
