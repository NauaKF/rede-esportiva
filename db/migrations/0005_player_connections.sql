-- Store confirmed player connections created from accepted interest requests.

CREATE TABLE player_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL,
  availability_id UUID NOT NULL,
  player_one_account_id UUID NOT NULL,
  player_two_account_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT player_connections_players_differ_check
    CHECK (player_one_account_id <> player_two_account_id),
  CONSTRAINT player_connections_request_key
    UNIQUE (request_id),
  CONSTRAINT player_connections_request_fk
    FOREIGN KEY (request_id)
    REFERENCES player_interest_requests (id)
    ON DELETE CASCADE,
  CONSTRAINT player_connections_availability_fk
    FOREIGN KEY (availability_id)
    REFERENCES player_availabilities (id)
    ON DELETE CASCADE,
  CONSTRAINT player_connections_player_one_fk
    FOREIGN KEY (player_one_account_id)
    REFERENCES player_profiles (account_id)
    ON DELETE CASCADE,
  CONSTRAINT player_connections_player_two_fk
    FOREIGN KEY (player_two_account_id)
    REFERENCES player_profiles (account_id)
    ON DELETE CASCADE
);
