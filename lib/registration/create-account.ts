import "server-only";

import { sql } from "@/lib/db";
import type { ArenaRegistrationInput, PlayerRegistrationInput, SportOption } from "./validation";

type CatalogRow = { sport_id: number; sport_name: string; level_id: number | null; level_label: string | null };

export async function getSportsCatalog(): Promise<SportOption[]> {
  const rows = await sql`
    SELECT sports.id AS sport_id, sports.name AS sport_name,
           sport_levels.id AS level_id, sport_levels.label AS level_label
    FROM sports
    LEFT JOIN sport_levels ON sport_levels.sport_id = sports.id
    WHERE sports.active = TRUE
    ORDER BY sports.name, sport_levels.sort_order
  ` as CatalogRow[];

  const byId = new Map<number, SportOption>();
  for (const row of rows) {
    const sportId = Number(row.sport_id);
    let sport = byId.get(sportId);
    if (!sport) {
      sport = { id: sportId, name: String(row.sport_name), levels: [] };
      byId.set(sportId, sport);
    }
    if (row.level_id !== null) sport.levels.push({ id: Number(row.level_id), label: String(row.level_label) });
  }
  return [...byId.values()];
}

async function validateSports(sportIds: number[], levelIds?: Map<number, number>) {
  const rows = await sql`
    SELECT sports.id AS sport_id, sport_levels.id AS level_id
    FROM sports
    LEFT JOIN sport_levels ON sport_levels.sport_id = sports.id
    WHERE sports.active = TRUE
  ` as { sport_id: number; level_id: number | null }[];

  const found = new Map<number, Set<number>>();
  for (const row of rows) {
    const sportId = Number(row.sport_id);
    const levels = found.get(sportId) ?? new Set<number>();
    if (row.level_id !== null) levels.add(Number(row.level_id));
    found.set(sportId, levels);
  }

  if (sportIds.length === 0 || sportIds.some((sportId) => !found.has(sportId))) return false;
  if (levelIds) {
    for (const [sportId, levelId] of levelIds) {
      if (!found.get(sportId)?.has(levelId)) return false;
    }
  }
  return true;
}

export async function createPlayerAccount(input: PlayerRegistrationInput) {
  const levelBySport = new Map(input.sports.map(({ sportId, levelId }) => [sportId, levelId]));
  if (!(await validateSports([...levelBySport.keys()], levelBySport))) {
    return { kind: "invalid-sports" as const };
  }

  const accountId = crypto.randomUUID();
  const locationId = crypto.randomUUID();
  const queries = [
    sql`INSERT INTO accounts (id, email, account_type, status) VALUES (${accountId}, ${input.email}, 'PLAYER', 'PENDING')`,
    sql`INSERT INTO locations (id, city, region_code) VALUES (${locationId}, ${input.location.city}, ${input.location.regionCode})`,
    sql`INSERT INTO player_profiles (account_id, name, bio, location_id) VALUES (${accountId}, ${input.name}, ${input.bio}, ${locationId})`,
    ...input.sports.map(({ sportId, levelId }) => sql`
      INSERT INTO player_sports (player_account_id, sport_id, sport_level_id)
      VALUES (${accountId}, ${sportId}, ${levelId})
    `),
  ];

  await sql.transaction(queries);
  return { kind: "created" as const };
}

export async function createArenaAccount(input: ArenaRegistrationInput) {
  if (!(await validateSports(input.sports))) return { kind: "invalid-sports" as const };

  const accountId = crypto.randomUUID();
  const locationId = crypto.randomUUID();
  const queries = [
    sql`INSERT INTO accounts (id, email, account_type, status) VALUES (${accountId}, ${input.email}, 'ARENA', 'PENDING')`,
    sql`INSERT INTO locations (id, city, region_code) VALUES (${locationId}, ${input.location.city}, ${input.location.regionCode})`,
    sql`INSERT INTO arena_profiles (account_id, name, location_id, street, street_number, address_complement)
      VALUES (${accountId}, ${input.name}, ${locationId}, ${input.location.street}, ${input.location.streetNumber}, ${input.location.addressComplement ?? null})`,
    ...input.sports.map((sportId) => sql`
      INSERT INTO arena_sports (arena_account_id, sport_id) VALUES (${accountId}, ${sportId})
    `),
  ];

  await sql.transaction(queries);
  return { kind: "created" as const };
}
