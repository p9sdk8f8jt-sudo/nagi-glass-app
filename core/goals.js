import { appendJournal, readJournal } from "./memory.js";

export function createGoal({ title, reason = "", successCriteria = "", priority = "normal" } = {}, storage) {
  const name = String(title || "").trim().slice(0, 200);
  if (!name) throw new Error("目標名を入力してください。");
  const level = ["low", "normal", "high"].includes(priority) ? priority : "normal";
  return appendJournal({ kind: "goal", title: name, reason: String(reason).slice(0, 2000), successCriteria: String(successCriteria).slice(0, 2000), priority: level, status: "active" }, storage);
}

export function updateGoal(goalId, { status, progressNote = "" } = {}, storage) {
  if (!["active", "paused", "completed", "cancelled"].includes(status)) throw new Error("無効な目標ステータスです。");
  const goal = readJournal(storage).find(x => x.id === goalId && x.kind === "goal");
  if (!goal) throw new Error("目標が見つかりません。");
  return appendJournal({ kind: "goal-update", goalId, title: goal.title, status, progressNote: String(progressNote).slice(0, 2000) }, storage);
}

export function listGoals(storage) {
  const rows = readJournal(storage);
  const goals = new Map();
  for (const row of rows) {
    if (row.kind === "goal") goals.set(row.id, { ...row });
    if (row.kind === "goal-update" && goals.has(row.goalId)) Object.assign(goals.get(row.goalId), { status: row.status, updatedAt: row.at, progressNote: row.progressNote });
  }
  return [...goals.values()].filter(x => x.status !== "cancelled").reverse();
}
