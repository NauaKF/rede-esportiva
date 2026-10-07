import "server-only";

import { requireAccount } from "@/lib/auth/require-account";
import { sql } from "@/lib/db";

export type PlayerConnection = {
  connectionId: string;
  otherPlayerName: string;
  sportName: string;
  city: string;
  region: string;
  connectedAt: string;
};

export type GetPlayerConnectionsResult =
  | { kind: "ok"; connections: PlayerConnection[] }
  | { kind: "not-authorized" }
  | { kind: "error" };

type PlayerConnectionRow = {
  connection_id: string;
  other_player_name: string;
  sport_name: string;
  city: string;
  region: string;
  connected_at: string | Date;
};

function toIsoString(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

/** Lists only connections involving the authenticated PLAYER, without exposing account IDs. */
export async function getPlayerConnections(): Promise<GetPlayerConnectionsResult> {
  const account = await requireAccount();

  if (account.accountType !== "PLAYER") return { kind: "not-authorized" };

  try {
    const rows = await sql`
      SELECT player_connections.id AS connection_id,
             other_profile.name AS other_player_name,
             sports.name AS sport_name,
             other_location.city,
             other_location.region_code AS region,
             player_connections.created_at AS connected_at
      FROM player_connections
      INNER JOIN player_availabilities
        ON player_availabilities.id = player_connections.availability_id
      INNER JOIN sports
        ON sports.id = player_availabilities.sport_id
      INNER JOIN player_profiles AS other_profile
        ON other_profile.account_id = CASE
          WHEN player_connections.player_one_account_id = ${account.accountId}::uuid
            THEN player_connections.player_two_account_id
          ELSE player_connections.player_one_account_id
        END
      INNER JOIN locations AS other_location
        ON other_location.id = other_profile.location_id
      WHERE player_connections.player_one_account_id = ${account.accountId}::uuid
         OR player_connections.player_two_account_id = ${account.accountId}::uuid
      ORDER BY player_connections.created_at DESC
    ` as PlayerConnectionRow[];

    return {
      kind: "ok",
      connections: rows.map((row) => ({
        connectionId: row.connection_id,
        otherPlayerName: row.other_player_name,
        sportName: row.sport_name,
        city: row.city,
        region: row.region,
        connectedAt: toIsoString(row.connected_at),
      })),
    };
  } catch {
    return { kind: "error" };
  }
}
