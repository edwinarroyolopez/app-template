# template-app

React Native starter aligned with the monorepo **workspace / account / capability** semantics (`ai/instructions/starter-semantics.md`).

## Layout

- `src/modules/*` — feature modules (canonical paths use **workspace** vocabulary).
- `src/stores/*` — persisted app state; **`auth.store`** is the source of truth for `workspaces` and `activeWorkspaceId`.
- `src/storage/legacy/*` — one-way persist migrations only (obsolete key names).
- `src/quarantine/legacy-domain/*` — optional example domain code; do not treat as part of the minimal starter contract.

## Docs

- New project flow: `../ai/START_NEW_PROJECT.md`
- Semantics: `../ai/instructions/starter-semantics.md`
