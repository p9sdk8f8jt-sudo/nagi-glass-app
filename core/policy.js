export const ChangePolicy = Object.freeze({
  autoApply: false,
  requireTests: true,
  requireSnapshot: true,
  protectedAreas: ["core/policy.js", "permissions", "secrets", "memory/export"],
});

export function assessChangeProposal(proposal = {}) {
  const files = Array.isArray(proposal.files) ? proposal.files : [];
  const protectedFiles = files.filter((file) =>
    ChangePolicy.protectedAreas.some((area) => String(file).includes(area))
  );
  const unsafe = proposal.destructive === true || proposal.changesPermissions === true || protectedFiles.length > 0;
  return {
    status: unsafe ? "requires-explicit-review" : "staged-for-review",
    safeToStage: !unsafe,
    protectedFiles,
    autoApplied: false,
  };
}
