import "server-only";

import { sql } from "@/lib/db";

const MAX_FILTER_LENGTH = 100;
const BOARD_RESULT_LIMIT = 100;

export type RegionalPlayerAvailabilityBoardFilters = {
  city: string;
  region: string;
  excludeAccountId: string;
  sportId?: number;
};

export type RegionalPlayerAvailability = {
  availabilityId: string;
  hasInterest: boolean;
  name: string;
  city: string;
  region: string;
  sport: string;
  startsAt: string;
  endsAt: string;
  timeZone: string;
};

export type SearchableSport = {
  id: number;
  name: string;
};

type SearchPlayerAvailabilityRow = {
  availability_id: string;
  has_interest: boolean;
  name: string;
  city: string;
  region: string;
  sport: string;
  starts_at: string | Date;
  ends_at: string | Date;
  time_zone: string;
};

type SearchableSportRow = {
  id: number;
  name: string;
};

export async function getSearchableSports(): Promise<SearchableSport[]> {
  const rows = await sql`
    SELECT id, name
    FROM sports
    WHERE active = TRUE
    ORDER BY name
  ` as SearchableSportRow[];

  return rows.map((row) => ({ id: Number(row.id), name: row.name }));
}

function normalizeRequiredLocation(value: string, field: string): string {
  const normalized = value?.trim();
  if (!normalized) throw new TypeError(`${field} is required.`);
  if (normalized.length > MAX_FILTER_LENGTH) {
    throw new RangeError(`${field} must be at most ${MAX_FILTER_LENGTH} characters.`);
  }
  return normalized;
}

function toIsoString(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

/** Lists future availability for active players in a required regional board area. */
export async function getRegionalPlayerAvailabilityBoard(
  filters: RegionalPlayerAvailabilityBoardFilters,
): Promise<RegionalPlayerAvailability[]> {
  const city = normalizeRequiredLocation(filters.city, "city");
  const region = normalizeRequiredLocation(filters.region, "region");
  const excludeAccountId = filters.excludeAccountId;
  if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(excludeAccountId)) {
    throw new TypeError("excludeAccountId must be a valid UUID.");
  }

  const sportId = filters.sportId ?? null;
  if (sportId !== null && (!Number.isSafeInteger(sportId) || sportId < 1 || sportId > 32767)) {
    throw new RangeError("sportId must be a valid positive smallint.");
  }

  const rows = await sql`
    SELECT player_availabilities.id AS availability_id,
           EXISTS (
             SELECT 1
             FROM player_interest_requests
             WHERE player_interest_requests.availability_id = player_availabilities.id
               AND player_interest_requests.sender_player_account_id = ${excludeAccountId}::uuid
           ) AS has_interest,
           player_profiles.name,
           locations.city,
           locations.region_code AS region,
           sports.name AS sport,
           player_availabilities.starts_at,
           player_availabilities.ends_at,
           player_availabilities.time_zone
    FROM player_availabilities
    INNER JOIN accounts
      ON accounts.id = player_availabilities.player_account_id
     AND accounts.account_type = 'PLAYER'
     AND accounts.status = 'ACTIVE'
    INNER JOIN player_profiles
      ON player_profiles.account_id = player_availabilities.player_account_id
    INNER JOIN locations
      ON locations.id = player_profiles.location_id
    INNER JOIN sports
      ON sports.id = player_availabilities.sport_id
     AND sports.active = TRUE
    WHERE player_availabilities.starts_at > now()
      AND (${sportId}::smallint IS NULL OR player_availabilities.sport_id = ${sportId}::smallint)
      AND lower(btrim(locations.city)) = lower(${city}::text)
      AND lower(btrim(locations.region_code)) = lower(${region}::text)
      AND accounts.id <> ${excludeAccountId}::uuid
    ORDER BY player_availabilities.starts_at, sports.name, player_profiles.name, accounts.id
    LIMIT ${BOARD_RESULT_LIMIT}
  ` as SearchPlayerAvailabilityRow[];

  return rows.map((row) => ({
    availabilityId: row.availability_id,
    hasInterest: row.has_interest,
    name: row.name,
    city: row.city,
    region: row.region,
    sport: row.sport,
    startsAt: toIsoString(row.starts_at),
    endsAt: toIsoString(row.ends_at),
    timeZone: row.time_zone,
  }));
}
