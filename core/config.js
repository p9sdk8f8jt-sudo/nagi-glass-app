export const SikeConfig = {
  name: "Sike.",
  role: "自立型AIへ育成中の試作コア",
  provider: process.env.AI_PROVIDER || "openai",
  model: process.env.AI_MODEL || "gpt-6-luna",
  webSearch: process.env.AUTO_WEB_SEARCH !== "false",
  maxHistory: 30,
  maxOutputTokens: Number(process.env.MAX_OUTPUT_TOKENS || 1200),
};
