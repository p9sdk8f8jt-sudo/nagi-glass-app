import test from "node:test";
import assert from "node:assert/strict";
import { appendJournal, readJournal, exportJournal, importJournal } from "../core/memory.js";
import { createGoal, listGoals, updateGoal } from "../core/goals.js";
import { createChangeRequest, reviewChangeRequest } from "../core/change-manager.js";
import { describeIdentity } from "../core/identity.js";
import { normalizeHistory } from "../core/agent.js";
import { SikeConfig } from "../core/config.js";

function storageMock() {
  const values = new Map();
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
  };
}

test("identity exposes safe growth boundaries", () => {
  const identity = describeIdentity();
  assert.equal(identity.name, "Sike.");
  assert.equal(identity.boundaries.mayApplyCodeChangesWithoutApproval, false);
});

test("journal can export and restore records", () => {
  const a = storageMock();
  appendJournal({ kind: "test", value: 1 }, a);
  const b = storageMock();
  assert.equal(importJournal(exportJournal(a), b), 1);
  assert.equal(readJournal(b)[0].kind, "test");
});

test("goal updates preserve the original goal record", () => {
  const storage = storageMock();
  const created = createGoal({ title: "テスト目標" }, storage);
  updateGoal(created.record.id, { status: "completed", progressNote: "完了" }, storage);
  assert.equal(listGoals(storage)[0].status, "completed");
  assert.equal(readJournal(storage).length, 2);
});

test("change review requires a snapshot and passing tests", () => {
  const storage = storageMock();
  const request = createChangeRequest({ title: "通常の変更", files: ["core/example.js"] }, storage);
  const id = request.record.id;
  const denied = reviewChangeRequest(id, { approved: true, snapshotReady: false, testsPassed: true }, storage);
  assert.equal(denied.record.approved, false);
  const accepted = reviewChangeRequest(id, { approved: true, snapshotReady: true, testsPassed: true }, storage);
  assert.equal(accepted.record.approved, true);
  assert.equal(accepted.record.applied, false);
});

test("protected paths cannot be approved automatically", () => {
  const storage = storageMock();
  const request = createChangeRequest({ title: "権限関連", files: ["permissions/roles.js"] }, storage);
  assert.equal(request.assessment.safeToStage, false);
  const review = reviewChangeRequest(request.record.id, { approved: true, snapshotReady: true, testsPassed: true }, storage);
  assert.equal(review.record.approved, false);
});

test("chat history keeps recent context but bounds tokens and ignores API error bubbles", () => {
  const history = [
    { role: "user", content: "oldest" },
    ...Array.from({ length: 12 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: String(i).repeat(3000) })),
    { role: "assistant", content: "AI接続エラー：一時的なエラー" },
    { role: "system", content: "ignore this role" },
  ];
  const normalized = normalizeHistory(history);
  assert.equal(normalized.length, SikeConfig.maxHistory);
  assert.ok(normalized.every(x => x.content.length <= SikeConfig.maxHistoryChars));
  assert.ok(normalized.every(x => !x.content.startsWith("AI接続エラー：")));
  assert.ok(normalized.every(x => x.role === "user" || x.role === "assistant"));
});

test("chat history safely handles invalid input", () => {
  assert.deepEqual(normalizeHistory(null), []);
  assert.deepEqual(normalizeHistory("not history"), []);
});
