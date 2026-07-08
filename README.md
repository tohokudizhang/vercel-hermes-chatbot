# Vercel Hermes Chatbot

This repository is a customized chatbot build for running a local or self-hosted Hermes service behind a Next.js chat UI.

The README focuses only on the changes in this customized version. Detailed maintenance notes are kept in [`vercel_custom_record.txt`](./vercel_custom_record.txt).

## Main Customizations

- Replaced Vercel AI Gateway model routing with a self-hosted Hermes OpenAI-compatible provider.
- Added environment-based Hermes model capability flags.
- Requires a real logged-in user before chat access.
- Blocks guest users from asking questions.
- Adds database-backed invite codes for registration.
- Adds a helper script for generating invite codes.
- Removes visible "Deploy with Vercel" UI entry points from the chat header.
- Adds custom DigCat/Hermes branding, logo usage, greeting text, and example prompts.
- Adds a local Postgres quick-start script for migration and development.
- Records all customization details in `vercel_custom_record.txt`.

## Required Environment

Create `.env.local` in the repository root:

```bash
POSTGRES_URL=postgres://postgres:postgres@localhost:5432/chatbot
HERMES_BASE_URL=http://127.0.0.1:8642/v1
HERMES_MODEL=DigCat_ORR_Agent1.0
HERMES_API_KEY=your_key_if_required
```

Optional Hermes capability flags:

```bash
HERMES_SUPPORTS_TOOLS=true
HERMES_SUPPORTS_VISION=false
HERMES_SUPPORTS_REASONING=false
```

Notes:

- Use `http://` unless Hermes is actually serving TLS.
- Do not use `0.0.0.0` as the client URL. Use `127.0.0.1`, `localhost`, a real server IP, a domain, or a container service name.
- `.env.local` is intentionally ignored and should not be committed.

## Local Postgres

Start a local Postgres container:

```bash
./start_postgres_chatbot.sh
```

Default database URL:

```bash
postgres://postgres:postgres@localhost:5432/chatbot
```

The script:

- starts `postgres:16-alpine`;
- stores local database files in `.postgres-chatbot`;
- creates the `chatbot` database when missing;
- waits for Postgres readiness;
- runs `pnpm db:migrate` when dependencies are installed.

Useful options:

```bash
RESET_DB=1 ./start_postgres_chatbot.sh
RUN_MIGRATIONS=0 ./start_postgres_chatbot.sh
HOST_PORT=5433 ./start_postgres_chatbot.sh
```

## Setup

```bash
pnpm install
./start_postgres_chatbot.sh
pnpm dev
```

The app runs at:

```text
http://localhost:3000
```

Make sure Hermes is running separately and reachable at `HERMES_BASE_URL`.

## Invite Codes

Registration requires a valid invite code bound to the user's email.

Generate a random invite code:

```bash
pnpm invite:add user@example.com
```

Generate a specific invite code:

```bash
pnpm invite:add user@example.com my-custom-code
```

Run migrations before creating invite codes:

```bash
pnpm db:migrate
```

## Verification

Type-check the customized app:

```bash
pnpm exec tsc --noEmit
```

## Migration Notes

For a new machine:

```bash
git clone git@github.com:tohokudizhang/vercel-hermes-chatbot.git
cd vercel-hermes-chatbot
pnpm install
./start_postgres_chatbot.sh
pnpm dev
```

Create `.env.local` manually with the values listed above.

More detailed change history:

```text
vercel_custom_record.txt
```
