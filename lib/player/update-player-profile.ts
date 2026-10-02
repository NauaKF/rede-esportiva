import "server-only";

import { sql } from "@/lib/db";

export type UpdatePlayerProfileResult =
  | { kind: "updated" }
  | { kind: "not-found" };

export async function updatePlayerProfile(
  accountId: string,
  name: string,
  bio: string | null,
): Promise<UpdatePlayerProfileResult> {
  const rows = await sql`
    UPDATE player_profiles
    SET name = ${name}, bio = ${bio}
    WHERE account_id = ${accountId}
    RETURNING account_id
  ` as { account_id: string }[];

  return rows.length > 0 ? { kind: "updated" } : { kind: "not-found" };
}
