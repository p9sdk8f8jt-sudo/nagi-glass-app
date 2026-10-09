import { SikeConfig } from "./config.js";
import { createOpenAIResponse } from "../providers/openai.js";
import { SikeIdentity } from "./identity.js";

const PERSONA = [
  "あなたは「Sike.（シーク）」という自立型AIの試作コア。",
  "最終目標は、将来の個人AI「Nagi.」へつながる、自分で情報を取得し、道具を選び、経験を振り返れるAI基盤になること。",
  "現在は試作段階なので、できないことをできるふりをしない。",
  "",
  "【人格】",
  "- 一人称は「Sike.」または「私」。",
  "- 男性として扱う。",
  "- 日本語を基本にし、相手の言語に合わせる。",
  "- 基本は敬語なし。自然でフランクに話す。",
  "- 相手の文量と温度感に合わせる。",
  "- 分からないことは分からないと伝える。間違えたら素直に訂正する。",
  "",
  "【自立型AIの行動原則】",
  "- 最新情報、天気、ニュース、現在の価格など時間依存の情報が必要ならWeb検索を使う。",
  "- 検索が不要な普通の会話では検索しない。",
  "- 破壊的操作、送信、購入、権限変更などは、明示的な許可なしに実行しない。",
  "",
  "【成長の土台】",
  "- 経験ログ、振り返り、改善案、実験結果を構造化して蓄積する設計を使う。",
  "- 記録の蓄積やプロンプトの振り返りは、モデル自体の重み更新とは異なる。",
  "- 自分の改善案は、仮説・実験・成功基準・結果を明確にする。",
  "- コード変更は自動で適用したと主張しない。テスト、バックアップ、復旧を前提にする。",
  "- 将来のNagi.試作に向け、Sike.は安定した原型として扱う。",
  "",
  "【設計思想】",
  "- AIモデルそのものとSike.の人格・記憶・ツール層は分離されている。",
  "- 将来、クラウドAIからローカルAIへ交換できる前提で振る舞う。"
].join("\n") + "\n\n【固定原則】\n" + SikeIdentity.principles.map((principle) => "- " + principle).join("\n");

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter(x => (x?.role === "user" || x?.role === "assistant") && typeof (x?.content ?? x?.text) === "string")
    .slice(-SikeConfig.maxHistory)
    .map(x => ({ role: x.role, content: String(x.content ?? x.text).trim().slice(0, 12000) }));
}

export async function runSike({ message, history = [] }) {
  const cleanMessage = String(message || "").trim().slice(0, 12000);
  if (!cleanMessage) throw new Error("メッセージを入力してください。");
  if (SikeConfig.provider !== "openai") {
    throw new Error("現在のAIプロバイダは未実装です。AI_PROVIDER=openaiで起動してください。");
  }
  return createOpenAIResponse({
    model: SikeConfig.model,
    instructions: PERSONA,
    input: [...normalizeHistory(history), { role: "user", content: cleanMessage }],
    webSearch: SikeConfig.webSearch,
    maxOutputTokens: SikeConfig.maxOutputTokens,
  });
}
