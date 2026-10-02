import "server-only";

import { sql } from "@/lib/db";

type PlayerProfileRow = {
  name: string;
  bio: string | null;
  city: string;
  region_code: string;
  sport_name: string | null;
  level_label: string | null;
};

export type PlayerProfile = {
  name: string;
  bio: string | null;
  location: {
    city: string;
    regionCode: string;
  };
  sports: {
    name: string;
    level: string | null;
  }[];
};

export async function getPlayerProfile(accountId: string): Promise<PlayerProfile | null> {
  const rows = await sql`
    SELECT player_profiles.name,
           player_profiles.bio,
           locations.city,
           locations.region_code,
           sports.name AS sport_name,
           sport_levels.label AS level_label
    FROM player_profiles
    INNER JOIN locations ON locations.id = player_profiles.location_id
    LEFT JOIN player_sports ON player_sports.player_account_id = player_profiles.account_id
    LEFT JOIN sports ON sports.id = player_sports.sport_id
    LEFT JOIN sport_levels
      ON sport_levels.id = player_sports.sport_level_id
      AND sport_levels.sport_id = player_sports.sport_id
    WHERE player_profiles.account_id = ${accountId}
    ORDER BY sports.name, sport_levels.sort_order
  ` as PlayerProfileRow[];

  const profile = rows[0];
  if (!profile) return null;

  const sports = rows.flatMap((row) =>
    row.sport_name === null ? [] : [{ name: row.sport_name, level: row.level_label }],
  );

  return {
    name: profile.name,
    bio: profile.bio,
    location: {
      city: profile.city,
      regionCode: profile.region_code,
    },
    sports,
  };
}
