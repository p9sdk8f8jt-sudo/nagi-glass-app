import { appendJournal } from "./memory.js";

export function createReflection({ prompt, reply, rating, note = "" }, storage) {
  const score = Number.isFinite(Number(rating)) ? Math.max(1, Math.min(5, Number(rating))) : null;
  return appendJournal({
    kind: "reflection",
    prompt: String(prompt || "").slice(0, 2000),
    reply: String(reply || "").slice(0, 4000),
    rating: score,
    note: String(note || "").slice(0, 2000),
  }, storage);
}

export function createImprovementProposal({ title, hypothesis, experiment, successCriteria, files = [] }, storage) {
  return appendJournal({
    kind: "improvement-proposal",
    title: String(title || "名称未設定").slice(0, 200),
    hypothesis: String(hypothesis || "").slice(0, 3000),
    experiment: String(experiment || "").slice(0, 3000),
    successCriteria: String(successCriteria || "").slice(0, 2000),
    files: Array.isArray(files) ? files.map(String).slice(0, 30) : [],
    status: "proposed",
    applied: false,
  }, storage);
}

export function recordExperiment({ proposalId, method, result, passed, notes = "" }, storage) {
  return appendJournal({
    kind: "experiment",
    proposalId: String(proposalId || ""),
    method: String(method || "").slice(0, 2000),
    result: String(result || "").slice(0, 3000),
    passed: Boolean(passed),
    notes: String(notes || "").slice(0, 2000),
  }, storage);
}
