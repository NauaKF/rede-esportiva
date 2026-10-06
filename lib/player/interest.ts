import "server-only";

import { sql } from "@/lib/db";

export type CreatePlayerInterestRequestResult =
  | { kind: "created"; id: string }
  | { kind: "account-unavailable" }
  | { kind: "availability-unavailable" }
  | { kind: "own-availability" }
  | { kind: "duplicate" }
  | { kind: "error" };

type InterestRequestRow = { kind: string; id: string | null };

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

/** accountId must come from requireAccount(), never from client-submitted data. */
export async function createPlayerInterestRequest(input: {
  availabilityId: string;
  accountId: string;
}): Promise<CreatePlayerInterestRequestResult> {
  if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(input.availabilityId)) {
    return { kind: "availability-unavailable" };
  }

  try {
    const rows = await sql`
      WITH sender AS (
        SELECT accounts.id
        FROM accounts
        WHERE accounts.id = ${input.accountId}::uuid
          AND accounts.account_type = 'PLAYER'
          AND accounts.status = 'ACTIVE'
      ), target AS (
        SELECT player_availabilities.id,
               player_availabilities.player_account_id
        FROM player_availabilities
        INNER JOIN accounts AS owner
          ON owner.id = player_availabilities.player_account_id
         AND owner.account_type = 'PLAYER'
         AND owner.status = 'ACTIVE'
        WHERE player_availabilities.id = ${input.availabilityId}::uuid
          AND player_availabilities.starts_at > now()
      ), inserted AS (
        INSERT INTO player_interest_requests (
          availability_id, sender_player_account_id
        )
        SELECT target.id, sender.id
        FROM target
        CROSS JOIN sender
        WHERE target.player_account_id <> sender.id
        ON CONFLICT (availability_id, sender_player_account_id) DO NOTHING
        RETURNING id
      )
      SELECT 'created' AS kind, inserted.id
      FROM inserted
      UNION ALL
      SELECT CASE
               WHEN NOT EXISTS (SELECT 1 FROM sender) THEN 'account-unavailable'
               WHEN NOT EXISTS (SELECT 1 FROM target) THEN 'availability-unavailable'
               WHEN EXISTS (
                 SELECT 1 FROM target CROSS JOIN sender
                 WHERE target.player_account_id = sender.id
               ) THEN 'own-availability'
               ELSE 'duplicate'
             END AS kind,
             NULL::uuid AS id
      WHERE NOT EXISTS (SELECT 1 FROM inserted)
      LIMIT 1
    ` as InterestRequestRow[];

    const row = rows[0];
    if (!row) return { kind: "error" };
    if (row.kind === "created" && row.id) return { kind: "created", id: row.id };
    if (
      row.kind === "account-unavailable" ||
      row.kind === "availability-unavailable" ||
      row.kind === "own-availability" ||
      row.kind === "duplicate"
    ) {
      return { kind: row.kind };
    }

    return { kind: "error" };
  } catch (error) {
    if (isUniqueViolation(error)) return { kind: "duplicate" };
    return { kind: "error" };
  }
}
