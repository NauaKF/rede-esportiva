import "server-only";

import { sql } from "@/lib/db";

export type PlayerAvailabilitySport = {
  id: number;
  name: string;
};

export type PlayerAvailability = {
  id: string;
  sportId: number;
  sportName: string;
  startsAt: string;
  endsAt: string;
  timeZone: string;
};

export type CreatePlayerAvailabilityResult =
  | { kind: "created"; id: string }
  | { kind: "sport-not-practiced" };

export type CancelPlayerAvailabilityResult =
  | { kind: "cancelled" }
  | { kind: "not-found" };

type SportRow = { id: number; name: string };
type AvailabilityRow = {
  id: string;
  sport_id: number;
  sport_name: string;
  starts_at: string | Date;
  ends_at: string | Date;
  time_zone: string;
};

function toIsoString(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

/** Pass accountId from requireAccount(), never from client-submitted form data. */
export async function getPlayerAvailabilitySports(accountId: string): Promise<PlayerAvailabilitySport[]> {
  const rows = await sql`
    SELECT sports.id, sports.name
    FROM player_sports
    INNER JOIN sports ON sports.id = player_sports.sport_id
    WHERE player_sports.player_account_id = ${accountId}
      AND sports.active = TRUE
    ORDER BY sports.name
  ` as SportRow[];

  return rows.map((row) => ({ id: Number(row.id), name: row.name }));
}

/** Lists only the availability records owned by the authenticated accountId. */
export async function getPlayerAvailabilities(accountId: string): Promise<PlayerAvailability[]> {
  const rows = await sql`
    SELECT player_availabilities.id,
           player_availabilities.sport_id,
           sports.name AS sport_name,
           player_availabilities.starts_at,
           player_availabilities.ends_at,
           player_availabilities.time_zone
    FROM player_availabilities
    INNER JOIN sports ON sports.id = player_availabilities.sport_id
    WHERE player_availabilities.player_account_id = ${accountId}
    ORDER BY player_availabilities.starts_at
  ` as AvailabilityRow[];

  return rows.map((row) => ({
    id: row.id,
    sportId: Number(row.sport_id),
    sportName: row.sport_name,
    startsAt: toIsoString(row.starts_at),
    endsAt: toIsoString(row.ends_at),
    timeZone: row.time_zone,
  }));
}

/** accountId must come from requireAccount(); sportId must be server-validated. */
export async function createPlayerAvailability(input: {
  accountId: string;
  sportId: number;
  startsAt: string;
  endsAt: string;
  timeZone: string;
}): Promise<CreatePlayerAvailabilityResult> {
  const rows = await sql`
    INSERT INTO player_availabilities (
      player_account_id, sport_id, starts_at, ends_at, time_zone
    )
    SELECT player_sports.player_account_id,
           player_sports.sport_id,
           ${input.startsAt}::timestamptz,
           ${input.endsAt}::timestamptz,
           ${input.timeZone}
    FROM player_sports
    INNER JOIN sports ON sports.id = player_sports.sport_id
    WHERE player_sports.player_account_id = ${input.accountId}
      AND player_sports.sport_id = ${input.sportId}
      AND sports.active = TRUE
    RETURNING id
  ` as { id: string }[];

  return rows[0] ? { kind: "created", id: rows[0].id } : { kind: "sport-not-practiced" };
}

/** Both identifiers are required; accountId must come from requireAccount(). */
export async function cancelPlayerAvailability(
  accountId: string,
  availabilityId: string,
): Promise<CancelPlayerAvailabilityResult> {
  const rows = await sql`
    DELETE FROM player_availabilities
    WHERE id = ${availabilityId}
      AND player_account_id = ${accountId}
    RETURNING id
  ` as { id: string }[];

  return rows.length > 0 ? { kind: "cancelled" } : { kind: "not-found" };
}
