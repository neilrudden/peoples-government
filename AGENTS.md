# AI coding agent instructions

## Project context
- This repository contains Daily Referendum, an independent South African civic participation and government-accountability platform.
- Read this file and the README before making changes.
- The README describes the current public site as a static HTML page in `index.html`, with Cloudflare Pages Functions and a D1-backed editorial workflow. Verify the current repository structure before relying on that description.
- Preserve the South African flag-inspired brand palette and the editorial privacy boundary: only approved, scheduled questions may be exposed publicly. Never expose draft suggestions, private editorial notes, or administrative credentials.

## Required working method
1. Start by inspecting the repository, current branch, recent history, and relevant implementation.
2. For non-trivial work, write a short plan and identify risks before editing.
3. Work only on a dedicated task branch or isolated Git worktree. Never work directly on `main`.
4. Keep changes focused. Do not perform unrelated refactors or overwrite user changes.
5. Add or update tests for behaviour changes. Run the relevant tests, linting, type checks, and build commands that the repository actually defines. Do not claim a check passed unless you ran it and observed success.
6. If a required service, secret, or external system is unavailable, explain the limitation and provide the exact check that remains outstanding.
7. Review your own diff for correctness, security, accessibility, and accidental secrets before committing.
8. Commit completed work to your task branch with a clear conventional commit message. Open a pull request with a summary, test evidence, risks, and any manual verification still needed.

## Approval and safety boundaries
- You may inspect, edit, test, and commit to your own task branch.
- **Never merge a pull request, push directly to `main`, deploy, publish, or change production configuration.** The repository owner must approve merges and deployments.
- Do not change GitHub repository settings, branch protection, secrets, Cloudflare settings, DNS, or production data unless the owner explicitly asks in a separate instruction.
- Never request, print, commit, or place secrets in source control. Use documented secret-management facilities and placeholders in examples.
- Treat production billing, user submissions, editorial records, and personal data as sensitive. Prefer synthetic test data.
- Do not run destructive commands, database migrations against production, or irreversible operations without explicit owner approval.

## Pull request expectations
Every pull request should state:
- What changed and why.
- Which tests/build checks were run, with actual outcomes.
- Security, privacy, data-migration, and deployment considerations.
- Any manual steps or decisions required from the owner.

When requirements are ambiguous or a change could affect public voting, editorial approval, privacy, billing, or production systems, stop and ask for clarification rather than guessing.
