# Agent Contribution Guide

These instructions apply to every agent and contributor working in this
repository.

## Protected branches

- Never commit or push directly to `development`, `main`, or `master`.
- Treat `development` as the integration branch and the starting point for all
  work.
- Submit completed work to `development` through a merge request.

## Starting work

Before changing files:

1. Read `docs/project-status.md` and the relevant roadmap phase.
2. Check that the working tree is clean. Do not overwrite unrelated changes.
3. Switch to `development` and update it from `origin/development`.
4. Create a focused branch from the updated `development` branch.

```bash
git switch development
git pull --ff-only origin development
git switch -c <type>/<short-name>
```

If updating `development` would overwrite local work, stop and report the
conflict instead of discarding changes.

## Branch naming

Use one of these lowercase branch types:

- `feat/<short-feature-name>` for a new feature
- `fix/<short-fix-name>` for a bug fix
- `chore/<short-task-name>` for maintenance, tooling, or CI/CD work
- `docs/<short-doc-name>` for documentation

Keep the name short and descriptive. Use kebab-case for multiple words.

Examples:

```text
feat/user-profile
fix/session-timeout
chore/cicd
docs/agent-workflow
```

## Commit messages

Every commit must explain what it does. Use this format:

```text
<type>/<Scope>: <imperative description>
```

Rules:

- Use the same type vocabulary as branches: `feat`, `fix`, `chore`, or `docs`.
- Use a short module, feature, or area name for `Scope`.
- Start the description with an imperative verb such as `Add`, `Update`,
  `Fix`, `Remove`, or `Refactor`.
- Keep each commit focused on one logical change.
- Do not use vague messages such as `updates`, `changes`, or `fix stuff`.

Examples:

```text
docs/Agents: Add repository workflow guide
feat/Profile: Add customer avatar upload
fix/Auth: Prevent expired session reuse
chore/CICD: Add pipeline lint job
```

## Before handing off work

- Update `docs/project-status.md` whenever the task changes delivery status,
  introduces or resolves a blocker, or changes the recommended next action.
- Never rely on chat history as the only project-status record.
- Review the diff for unrelated or accidental changes.
- Run the relevant tests, linting, and formatting checks.
- Report any checks that could not be run.
- Push only the feature branch, never a protected branch.
- Open a merge request targeting `development`.
