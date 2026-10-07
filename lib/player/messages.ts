import "server-only";

import { requireAccount } from "@/lib/auth/require-account";
import { sql } from "@/lib/db";

const UUID_PATTERN = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const MAX_MESSAGE_LENGTH = 1000;

export type PlayerMessage = {
  id: string;
  message: string;
  senderAccountId: string;
  createdAt: string;
};

export type GetPlayerConnectionMessagesResult =
  | { kind: "ok"; messages: PlayerMessage[] }
  | { kind: "invalid-connection-id" }
  | { kind: "not-authorized" }
  | { kind: "connection-unavailable" }
  | { kind: "error" };

export type SendPlayerConnectionMessageResult =
  | { kind: "created"; message: PlayerMessage }
  | { kind: "invalid-connection-id" }
  | { kind: "invalid-message" }
  | { kind: "not-authorized" }
  | { kind: "connection-unavailable" }
  | { kind: "error" };

type PlayerMessageRow = {
  id: string;
  message: string;
  sender_account_id: string;
  created_at: string | Date;
};

type PlayerConnectionMessageListRow = {
  id: string | null;
  message: string | null;
  sender_account_id: string | null;
  created_at: string | Date | null;
};

function toPlayerMessage(row: PlayerMessageRow): PlayerMessage {
  return {
    id: row.id,
    message: row.message,
    senderAccountId: row.sender_account_id,
    createdAt: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : new Date(row.created_at).toISOString(),
  };
}

/** Lists messages only when the authenticated PLAYER participates in the connection. */
export async function getPlayerConnectionMessages(
  connectionId: string,
): Promise<GetPlayerConnectionMessagesResult> {
  const account = await requireAccount();

  if (account.accountType !== "PLAYER") return { kind: "not-authorized" };
  if (typeof connectionId !== "string" || !UUID_PATTERN.test(connectionId)) {
    return { kind: "invalid-connection-id" };
  }

  try {
    const rows = await sql`
      WITH authorized_connection AS (
        SELECT player_connections.id
        FROM player_connections
        WHERE player_connections.id = ${connectionId}::uuid
          AND (
            player_connections.player_one_account_id = ${account.accountId}::uuid
            OR player_connections.player_two_account_id = ${account.accountId}::uuid
          )
      )
      SELECT player_messages.id,
             player_messages.message,
             player_messages.sender_account_id,
             player_messages.created_at
      FROM authorized_connection
      LEFT JOIN player_messages
        ON player_messages.connection_id = authorized_connection.id
      ORDER BY player_messages.created_at ASC NULLS LAST, player_messages.id ASC NULLS LAST
    ` as PlayerConnectionMessageListRow[];

    if (rows.length === 0) return { kind: "connection-unavailable" };

    const messages: PlayerMessage[] = [];
    for (const row of rows) {
      if (row.id === null) continue;
      if (row.message === null || row.sender_account_id === null || row.created_at === null) {
        return { kind: "error" };
      }
      messages.push(toPlayerMessage({
        id: row.id,
        message: row.message,
        sender_account_id: row.sender_account_id,
        created_at: row.created_at,
      }));
    }

    return { kind: "ok", messages };
  } catch {
    return { kind: "error" };
  }
}

/** Sends a trimmed message using the sender identity from the authenticated session. */
export async function sendPlayerConnectionMessage(
  connectionId: string,
  message: string,
): Promise<SendPlayerConnectionMessageResult> {
  const account = await requireAccount();

  if (account.accountType !== "PLAYER") return { kind: "not-authorized" };
  if (typeof connectionId !== "string" || !UUID_PATTERN.test(connectionId)) {
    return { kind: "invalid-connection-id" };
  }
  if (typeof message !== "string") return { kind: "invalid-message" };

  const trimmedMessage = message.trim();
  if (!trimmedMessage || Array.from(trimmedMessage).length > MAX_MESSAGE_LENGTH) {
    return { kind: "invalid-message" };
  }

  try {
    const rows = await sql`
      INSERT INTO player_messages (
        connection_id,
        sender_account_id,
        message
      )
      SELECT player_connections.id,
             ${account.accountId}::uuid,
             ${trimmedMessage}::text
      FROM player_connections
      WHERE player_connections.id = ${connectionId}::uuid
        AND (
          player_connections.player_one_account_id = ${account.accountId}::uuid
          OR player_connections.player_two_account_id = ${account.accountId}::uuid
        )
      RETURNING id, message, sender_account_id, created_at
    ` as PlayerMessageRow[];

    if (!rows[0]) return { kind: "connection-unavailable" };
    return { kind: "created", message: toPlayerMessage(rows[0]) };
  } catch {
    return { kind: "error" };
  }
}
