import { appendJournal, readJournal } from "./memory.js";
import { assessChangeProposal } from "./policy.js";

export function createChangeRequest({ title, rationale = "", files = [], tests = "", rollbackPlan = "" } = {}, storage) {
  const name = String(title || "").trim();
  if (!name) throw new Error("変更案のタイトルを入力してください。");
  const proposal = {
    title: name.slice(0, 200),
    rationale: String(rationale).slice(0, 3000),
    files: Array.isArray(files) ? files.map(String).slice(0, 30) : [],
    tests: String(tests).slice(0, 3000),
    rollbackPlan: String(rollbackPlan).slice(0, 2000),
  };
  const assessment = assessChangeProposal(proposal);
  const result = appendJournal({ kind: "change-request", ...proposal, assessment, status: "needs-review", approved: false, applied: false }, storage);
  return { ...result, assessment };
}

export function reviewChangeRequest(id, { approved = false, reviewerNote = "", snapshotReady = false, testsPassed = false } = {}, storage) {
  const request = readJournal(storage).find(x => x.id === id && x.kind === "change-request");
  if (!request) throw new Error("変更案が見つかりません。");
  const canApprove = approved === true && request.assessment?.safeToStage === true && snapshotReady === true && testsPassed === true;
  return appendJournal({
    kind: "change-review",
    requestId: id,
    title: request.title,
    approved: canApprove,
    status: canApprove ? "approved-for-manual-application" : "needs-review",
    reviewerNote: String(reviewerNote).slice(0, 2000),
    snapshotReady: Boolean(snapshotReady),
    testsPassed: Boolean(testsPassed),
    applied: false,
  }, storage);
}

export function listChangeRequests(storage) {
  const rows = readJournal(storage);
  const items = new Map();
  for (const row of rows) {
    if (row.kind === "change-request") items.set(row.id, { ...row });
    if (row.kind === "change-review" && items.has(row.requestId)) {
      const item = items.get(row.requestId);
      item.review = row;
      item.status = row.status;
    }
  }
  return [...items.values()].reverse();
}
