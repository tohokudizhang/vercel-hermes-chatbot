CREATE TABLE IF NOT EXISTS "InviteCode" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" varchar(64) NOT NULL,
  "code" varchar(128) NOT NULL,
  "used" boolean DEFAULT false NOT NULL,
  "usedAt" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "InviteCode_code_idx" ON "InviteCode" ("code");
