-- Store player interest requests for existing player availability windows.

CREATE TABLE player_interest_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  availability_id UUID NOT NULL,
  sender_player_account_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT player_interest_requests_status_check
    CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED')),
  CONSTRAINT player_interest_requests_availability_fk
    FOREIGN KEY (availability_id)
    REFERENCES player_availabilities (id)
    ON DELETE CASCADE,
  CONSTRAINT player_interest_requests_sender_player_fk
    FOREIGN KEY (sender_player_account_id)
    REFERENCES player_profiles (account_id)
    ON DELETE CASCADE,
  CONSTRAINT player_interest_requests_availability_sender_key
    UNIQUE (availability_id, sender_player_account_id)
);

CREATE INDEX player_interest_requests_availability_status_idx
  ON player_interest_requests (availability_id, status);
