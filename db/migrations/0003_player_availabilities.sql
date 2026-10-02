-- Store player availability windows for a practiced sport.

CREATE TABLE player_availabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_account_id UUID NOT NULL,
  sport_id SMALLINT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  time_zone TEXT NOT NULL CHECK (btrim(time_zone) <> ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT player_availabilities_time_range_check
    CHECK (ends_at > starts_at),
  CONSTRAINT player_availabilities_player_fk
    FOREIGN KEY (player_account_id)
    REFERENCES player_profiles (account_id)
    ON DELETE CASCADE,
  CONSTRAINT player_availabilities_player_sport_fk
    FOREIGN KEY (player_account_id, sport_id)
    REFERENCES player_sports (player_account_id, sport_id)
    ON DELETE CASCADE
);

CREATE INDEX player_availabilities_player_starts_idx
  ON player_availabilities (player_account_id, starts_at);
