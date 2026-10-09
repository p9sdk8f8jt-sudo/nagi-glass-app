# Sike Current-State Snapshot

Snapshot date: 2026-10-09 (JST)

## Purpose
This branch preserves the current Sike prototype as a recovery point before further changes. Do not treat this branch as the production deployment.

## Source
- Repository: https://github.com/p9sdk8f8jt-sudo/nagi-glass-app
- Snapshot branch: sike-current-state-snapshot-2026-10-09
- Base commit captured: 061f98f64edf5a5d219a43f562bb4b2093468b5b
- Earlier original snapshot branch: sike-original-snapshot-2026-10-09 (based on dc4ad402345f7563c30afb6becccceb7c558337f)

## Existing features to preserve
- Chat UI and browser-local recent conversation history
- /api/chat endpoint and OpenAI Responses API adapter
- Web search support and source/citation display
- LocalStorage journal, conversation prompt/result/error records, JSON export/import backup
- Reflection, self-observation, improvement proposals, experiment results
- Identity/core principles and goal management
- Change requests and safety review (review/snapshot/tests; no automatic code application)
- Model adapter architecture and GitHub Actions Node test workflow

## Current architecture / limits
- Main UI: index.html
- API: api/chat.js
- Agent and limits: core/agent.js, core/config.js
- Provider: providers/openai.js
- Core modules: core/identity.js, core/goals.js, core/change-manager.js, core/learning.js, core/memory.js, core/reflection.js, core/policy.js
- Tests: tests/core.test.js
- Browser LocalStorage is per browser/device; it is not shared server-side persistence.
- The current prototype can record observations/proposals but does not autonomously modify its own source code or train its model weights.
- The agent normalizes chat history to the most recent 10 messages, truncates each history item to 2,000 characters, and caps the current message at 6,000 characters.
- Default output-token setting is 800, capped at 1,200.
- Provider code includes readable handling for OpenAI rate-limit errors.

## Status at snapshot time (not verified as resolved)
- Latest known Vercel checks on the captured base commit reported `build-rate-limit`. This is a Vercel build/deployment quota issue and does not by itself prove the app source has a build error.
- A prior live chat request showed an OpenAI TPM/rate-limit error for model `gpt-6-luna`. This is separate from Vercel deployment limits.
- Do not claim the snapshot is deployed or that tests passed without checking the actual deployment and CI results.
- Avoid repeatedly pushing production commits while Vercel build-rate-limit remains active.
