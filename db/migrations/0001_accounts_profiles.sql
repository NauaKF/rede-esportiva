-- Rede Esportiva MVP: accounts and type-specific profiles.
-- Apply only after reviewing this migration. This file has not been run.

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL CHECK (btrim(email) <> ''),
  account_type TEXT NOT NULL
    CHECK (account_type IN ('PLAYER', 'ARENA')),
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED')),
  email_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Supports subtype foreign keys that enforce a matching profile type.
  CONSTRAINT accounts_id_account_type_key UNIQUE (id, account_type)
);

CREATE UNIQUE INDEX accounts_email_ci_uidx
  ON accounts (lower(btrim(email)));

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code CHAR(2) NOT NULL DEFAULT 'BR',
  region_code TEXT NOT NULL CHECK (btrim(region_code) <> ''),
  city TEXT NOT NULL CHECK (btrim(city) <> ''),
  neighborhood TEXT,
  latitude NUMERIC(9, 6),
  longitude NUMERIC(9, 6),

  CONSTRAINT locations_coordinate_pair_check
    CHECK ((latitude IS NULL) = (longitude IS NULL)),
  CONSTRAINT locations_latitude_range_check
    CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
  CONSTRAINT locations_longitude_range_check
    CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
);

CREATE INDEX locations_country_region_city_idx
  ON locations (country_code, region_code, lower(city));

CREATE TABLE sports (
  id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE sport_levels (
  id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sport_id SMALLINT NOT NULL REFERENCES sports (id) ON DELETE RESTRICT,
  code TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order SMALLINT NOT NULL,

  CONSTRAINT sport_levels_sport_code_key UNIQUE (sport_id, code),
  CONSTRAINT sport_levels_sport_id_id_key UNIQUE (sport_id, id),
  CONSTRAINT sport_levels_sort_order_check CHECK (sort_order > 0)
);

CREATE INDEX sport_levels_sport_order_idx
  ON sport_levels (sport_id, sort_order);

CREATE TABLE player_profiles (
  account_id UUID PRIMARY KEY,
  account_type TEXT NOT NULL DEFAULT 'PLAYER'
    CHECK (account_type = 'PLAYER'),
  name TEXT NOT NULL CHECK (btrim(name) <> ''),
  photo_key TEXT,
  bio TEXT,
  location_id UUID NOT NULL REFERENCES locations (id) ON DELETE RESTRICT,

  CONSTRAINT player_profiles_account_type_fk
    FOREIGN KEY (account_id, account_type)
    REFERENCES accounts (id, account_type)
    ON DELETE CASCADE
);

CREATE INDEX player_profiles_location_idx
  ON player_profiles (location_id);

CREATE TABLE player_sports (
  player_account_id UUID NOT NULL
    REFERENCES player_profiles (account_id) ON DELETE CASCADE,
  sport_id SMALLINT NOT NULL
    REFERENCES sports (id) ON DELETE RESTRICT,
  sport_level_id SMALLINT,

  CONSTRAINT player_sports_pkey PRIMARY KEY (player_account_id, sport_id),
  CONSTRAINT player_sports_level_sport_fk
    FOREIGN KEY (sport_id, sport_level_id)
    REFERENCES sport_levels (sport_id, id)
    ON DELETE RESTRICT
);

CREATE INDEX player_sports_sport_idx
  ON player_sports (sport_id);

CREATE TABLE arena_profiles (
  account_id UUID PRIMARY KEY,
  account_type TEXT NOT NULL DEFAULT 'ARENA'
    CHECK (account_type = 'ARENA'),
  name TEXT NOT NULL CHECK (btrim(name) <> ''),
  logo_key TEXT,
  description TEXT,
  location_id UUID NOT NULL REFERENCES locations (id) ON DELETE RESTRICT,
  street TEXT NOT NULL CHECK (btrim(street) <> ''),
  street_number TEXT NOT NULL CHECK (btrim(street_number) <> ''),
  address_complement TEXT,
  postal_code TEXT,

  CONSTRAINT arena_profiles_account_type_fk
    FOREIGN KEY (account_id, account_type)
    REFERENCES accounts (id, account_type)
    ON DELETE CASCADE
);

CREATE INDEX arena_profiles_location_idx
  ON arena_profiles (location_id);

CREATE TABLE arena_sports (
  arena_account_id UUID NOT NULL
    REFERENCES arena_profiles (account_id) ON DELETE CASCADE,
  sport_id SMALLINT NOT NULL
    REFERENCES sports (id) ON DELETE RESTRICT,

  CONSTRAINT arena_sports_pkey PRIMARY KEY (arena_account_id, sport_id)
);

CREATE INDEX arena_sports_sport_idx
  ON arena_sports (sport_id);

-- Seed one generic three-level scale per modality. Each sport can evolve its
-- own level labels and ordering without changing player_sports.
INSERT INTO sports (code, name)
VALUES
  ('tennis', 'Tênis'),
  ('beach_tennis', 'Beach Tennis'),
  ('volleyball', 'Vôlei')
ON CONFLICT (code) DO NOTHING;

INSERT INTO sport_levels (sport_id, code, label, sort_order)
SELECT sports.id, levels.code, levels.label, levels.sort_order
FROM (
  VALUES
    ('tennis', 'BEGINNER', 'Iniciante', 1),
    ('tennis', 'INTERMEDIATE', 'Intermediário', 2),
    ('tennis', 'ADVANCED', 'Avançado', 3),
    ('beach_tennis', 'BEGINNER', 'Iniciante', 1),
    ('beach_tennis', 'INTERMEDIATE', 'Intermediário', 2),
    ('beach_tennis', 'ADVANCED', 'Avançado', 3),
    ('volleyball', 'BEGINNER', 'Iniciante', 1),
    ('volleyball', 'INTERMEDIATE', 'Intermediário', 2),
    ('volleyball', 'ADVANCED', 'Avançado', 3)
) AS levels(sport_code, code, label, sort_order)
JOIN sports ON sports.code = levels.sport_code
ON CONFLICT (sport_id, code) DO NOTHING;
