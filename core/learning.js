import { appendJournal, readJournal } from "./memory.js";
import { createImprovementProposal } from "./reflection.js";

/**
 * Creates a reviewable learning candidate from recent records.
 * It records hypotheses only; it does not change model weights or execute code.
 */
export function observeForLearning({ storage = globalThis.localStorage, focus = "" } = {}) {
  const rows = readJournal(storage);
  const recent = rows.slice(-100);
  const errors = recent.filter((x) => x.kind === "error");
  const reflections = recent.filter((x) => x.kind === "reflection");
  const proposals = recent.filter((x) => x.kind === "improvement-proposal" && x.status === "proposed");
  const summary = {
    inspected: recent.length,
    errors: errors.length,
    reflections: reflections.length,
    openProposals: proposals.length,
    focus: String(focus).slice(0, 500),
  };
  appendJournal({ kind: "self-observation", summary }, storage);
  if (!recent.length) return { summary, proposal: null, reason: "not-enough-data" };

  const hypothesis = errors.length
    ? "最近のエラー記録を分類し、再現条件と対処法を確認すると信頼性が上がる可能性がある。"
    : reflections.length
      ? "振り返りの評価と理由を比較し、回答の改善パターンを抽出できる可能性がある。"
      : "会話と行動記録を増やし、改善対象を根拠に基づいて選ぶ必要がある。";
  const proposal = createImprovementProposal({
    title: errors.length ? "エラー原因の分類" : "経験記録のパターン分析",
    hypothesis,
    experiment: "対象記録を少数抽出し、改善前後を同じ基準で比較する。コード変更はまだ行わない。",
    successCriteria: "根拠となる記録があり、再現可能な評価基準で改善が確認できること。",
    files: [],
  }, storage);
  return { summary, proposal: proposal.record, reason: "proposal-created-not-applied" };
}
