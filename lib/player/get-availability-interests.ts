import "server-only";

import { requireAccount } from "@/lib/auth/require-account";
import { sql } from "@/lib/db";

const playerInterestRequestStatuses = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "CANCELLED",
] as const;

export type PlayerInterestRequestStatus = (typeof playerInterestRequestStatuses)[number];

export type PlayerAvailabilityInterest = {
  name: string;
  city: string;
  region: string;
  sport: string;
  status: PlayerInterestRequestStatus;
  createdAt: string;
};

export type OwnedPlayerAvailabilityInterest = PlayerAvailabilityInterest & {
  requestId: string;
};

export type GetPlayerAvailabilityInterestsResult =
  | { kind: "ok"; interests: PlayerAvailabilityInterest[] }
  | { kind: "invalid-availability-id" }
  | { kind: "invalid-status" }
  | { kind: "not-authorized" }
  | { kind: "not-found" }
  | { kind: "error" };

export type PlayerAvailabilityInterestsGroup = {
  availabilityId: string;
  interests: OwnedPlayerAvailabilityInterest[];
};

export type GetOwnedPlayerAvailabilityInterestsResult =
  | { kind: "ok"; availabilities: PlayerAvailabilityInterestsGroup[] }
  | { kind: "not-authorized" }
  | { kind: "error" };

type InterestRow = {
  request_id: string | null;
  name: string | null;
  city: string | null;
  region: string | null;
  sport: string;
  status: string | null;
  created_at: string | Date | null;
};

type OwnedAvailabilityInterestRow = InterestRow & {
  availability_id: string;
};

function isPlayerInterestRequestStatus(value: unknown): value is PlayerInterestRequestStatus {
  return typeof value === "string" &&
    playerInterestRequestStatuses.some((status) => status === value);
}

function toIsoString(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toPlayerAvailabilityInterest(row: InterestRow): PlayerAvailabilityInterest | null {
  if (row.request_id === null) return null;
  if (
    row.name === null ||
    row.city === null ||
    row.region === null ||
    row.status === null ||
    row.created_at === null ||
    !isPlayerInterestRequestStatus(row.status)
  ) {
    return null;
  }

  return {
    name: row.name,
    city: row.city,
    region: row.region,
    sport: row.sport,
    status: row.status,
    createdAt: toIsoString(row.created_at),
  };
}

/** The availability owner is taken from requireAccount(), never from client input. */
export async function getPlayerAvailabilityInterests(
  availabilityId: string,
  status?: PlayerInterestRequestStatus,
): Promise<GetPlayerAvailabilityInterestsResult> {
  const account = await requireAccount();

  if (account.accountType !== "PLAYER") return { kind: "not-authorized" };
  if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(availabilityId)) {
    return { kind: "invalid-availability-id" };
  }
  if (status !== undefined && !isPlayerInterestRequestStatus(status)) {
    return { kind: "invalid-status" };
  }

  try {
    const rows = await sql`
      SELECT player_interest_requests.id AS request_id,
             player_profiles.name,
             locations.city,
             locations.region_code AS region,
             sports.name AS sport,
             player_interest_requests.status,
             player_interest_requests.created_at
      FROM player_availabilities
      INNER JOIN sports
        ON sports.id = player_availabilities.sport_id
      LEFT JOIN player_interest_requests
        ON player_interest_requests.availability_id = player_availabilities.id
       AND (${status ?? null}::text IS NULL
         OR player_interest_requests.status = ${status ?? null}::text)
      LEFT JOIN player_profiles
        ON player_profiles.account_id = player_interest_requests.sender_player_account_id
      LEFT JOIN locations
        ON locations.id = player_profiles.location_id
      WHERE player_availabilities.id = ${availabilityId}::uuid
        AND player_availabilities.player_account_id = ${account.accountId}::uuid
      ORDER BY CASE
                 WHEN player_interest_requests.status = 'PENDING' THEN 0
                 ELSE 1
               END,
               player_interest_requests.created_at ASC
    ` as InterestRow[];

    if (rows.length === 0) return { kind: "not-found" };

    const interests: PlayerAvailabilityInterest[] = [];
    for (const row of rows) {
      // A left join produces one empty row when the owned availability has no
      // requests matching the optional status filter.
      const interest = toPlayerAvailabilityInterest(row);
      if (!interest) return { kind: "error" };
      interests.push(interest);
    }

    return { kind: "ok", interests };
  } catch {
    return { kind: "error" };
  }
}

/** Loads interests for all availability cards owned by the authenticated player in one query. */
export async function getOwnedPlayerAvailabilityInterests(): Promise<GetOwnedPlayerAvailabilityInterestsResult> {
  const account = await requireAccount();

  if (account.accountType !== "PLAYER") return { kind: "not-authorized" };

  try {
    const rows = await sql`
      SELECT player_availabilities.id AS availability_id,
             player_interest_requests.id AS request_id,
             player_profiles.name,
             locations.city,
             locations.region_code AS region,
             sports.name AS sport,
             player_interest_requests.status,
             player_interest_requests.created_at
      FROM player_availabilities
      INNER JOIN sports
        ON sports.id = player_availabilities.sport_id
      LEFT JOIN player_interest_requests
        ON player_interest_requests.availability_id = player_availabilities.id
      LEFT JOIN player_profiles
        ON player_profiles.account_id = player_interest_requests.sender_player_account_id
      LEFT JOIN locations
        ON locations.id = player_profiles.location_id
      WHERE player_availabilities.player_account_id = ${account.accountId}::uuid
      ORDER BY player_availabilities.id,
               CASE
                 WHEN player_interest_requests.status = 'PENDING' THEN 0
                 ELSE 1
               END,
               player_interest_requests.created_at ASC
    ` as OwnedAvailabilityInterestRow[];

    const groups = new Map<string, OwnedPlayerAvailabilityInterest[]>();
    for (const row of rows) {
      let interests = groups.get(row.availability_id);
      if (!interests) {
        interests = [];
        groups.set(row.availability_id, interests);
      }

      if (row.request_id !== null) {
        const interest = toPlayerAvailabilityInterest(row);
        if (!interest) return { kind: "error" };
        interests.push({ ...interest, requestId: row.request_id });
      }
    }

    return {
      kind: "ok",
      availabilities: [...groups].map(([availabilityId, interests]) => ({ availabilityId, interests })),
    };
  } catch {
    return { kind: "error" };
  }
}
