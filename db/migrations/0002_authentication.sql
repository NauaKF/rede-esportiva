-- Rede Esportiva authentication: store password hashes on accounts.
-- Existing accounts keep a NULL password_hash until a password is set.

ALTER TABLE accounts
  ADD COLUMN password_hash TEXT;
