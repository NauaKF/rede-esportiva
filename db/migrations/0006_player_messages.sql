-- Store messages exchanged through confirmed player connections.

CREATE TABLE player_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL,
  sender_account_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT player_messages_message_not_blank_check
    CHECK (btrim(message) <> ''),
  CONSTRAINT player_messages_connection_fk
    FOREIGN KEY (connection_id)
    REFERENCES player_connections (id)
    ON DELETE CASCADE,
  CONSTRAINT player_messages_sender_player_fk
    FOREIGN KEY (sender_account_id)
    REFERENCES player_profiles (account_id)
    ON DELETE CASCADE
);

CREATE INDEX player_messages_connection_created_idx
  ON player_messages (connection_id, created_at);

CREATE INDEX player_messages_sender_idx
  ON player_messages (sender_account_id);
