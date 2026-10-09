export const SikeConfig = {
  name: "Sike.",
  role: "自立型AIへ育成中の試作コア",
  provider: process.env.AI_PROVIDER || "openai",
  model: process.env.AI_MODEL || "gpt-6-luna",
  webSearch: process.env.AUTO_WEB_SEARCH !== "false",
  // Keep enough recent context while preventing old, long chats from exhausting TPM limits.
  maxHistory: 10,
  maxHistoryChars: 2000,
  maxMessageChars: 6000,
  // Keep responses useful, while allowing an environment override within a safe ceiling.
  maxOutputTokens: Math.min(1200, Math.max(256, Number(process.env.MAX_OUTPUT_TOKENS) || 800)),
};
