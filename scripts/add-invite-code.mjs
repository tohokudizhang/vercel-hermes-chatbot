#!/usr/bin/env node
import { randomBytes } from "node:crypto";
import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

function parseArgs(argv) {
  const args = argv.filter((arg) => arg !== "--");
  const options = { email: null, code: null };

  for (const arg of args) {
    if (arg.startsWith("--")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    if (!options.email) {
      options.email = arg;
      continue;
    }

    if (!options.code) {
      options.code = arg;
      continue;
    }

    throw new Error("Usage: pnpm invite:add user@example.com [invite-code]");
  }

  if (!options.email) {
    throw new Error("Usage: pnpm invite:add user@example.com [invite-code]");
  }

  return options;
}

function generateInviteCode() {
  return `invite-${randomBytes(9).toString("base64url")}`;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateInviteCode(code) {
  return /^[A-Za-z0-9._~:-]+$/.test(code);
}

try {
  const options = parseArgs(process.argv.slice(2));
  const email = options.email.trim().toLowerCase();
  const code = options.code?.trim() || generateInviteCode();

  if (!validateEmail(email)) {
    throw new Error("Please provide a valid email address");
  }

  if (!validateInviteCode(code)) {
    throw new Error(
      "Invite code can only contain letters, numbers, dot, underscore, tilde, colon, or hyphen"
    );
  }

  if (!process.env.POSTGRES_URL) {
    throw new Error("POSTGRES_URL is required to create invite codes");
  }

  const sql = postgres(process.env.POSTGRES_URL, { max: 1 });
  const [invite] = await sql`
    INSERT INTO "InviteCode" ("email", "code")
    VALUES (${email}, ${code})
    RETURNING "id", "email", "code", "createdAt"
  `;

  await sql.end();

  console.log("Invite code added:");
  console.log(invite.code);
  console.log(`Email: ${invite.email}`);
  console.log(`Invite id: ${invite.id}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
