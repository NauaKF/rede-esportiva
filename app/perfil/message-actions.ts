"use server";

import { requireAccount } from "@/lib/auth/require-account";
import {
  getPlayerConnectionMessages,
  sendPlayerConnectionMessage,
  type PlayerMessage,
} from "@/lib/player/messages";

const UUID_PATTERN = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

export type ChatMessageForClient = {
  id: string;
  message: string;
  isOwnMessage: boolean;
  createdAt: string;
};

export type PlayerMessagesActionState = {
  success?: string;
  error?: string;
  messages?: ChatMessageForClient[];
  message?: ChatMessageForClient;
  fieldErrors?: {
    connectionId?: string;
    message?: string;
  };
};

function toClientMessage(message: PlayerMessage, accountId: string): ChatMessageForClient {
  return {
    id: message.id,
    message: message.message,
    isOwnMessage: message.senderAccountId === accountId,
    createdAt: message.createdAt,
  };
}

export async function getConnectionMessagesAction(
  connectionId: unknown,
): Promise<PlayerMessagesActionState> {
  const account = await requireAccount();

  if (account.accountType !== "PLAYER") {
    return { error: "Não foi possível acessar as mensagens desta conexão." };
  }
  if (typeof connectionId !== "string" || !UUID_PATTERN.test(connectionId)) {
    return { fieldErrors: { connectionId: "Selecione uma conexão válida." } };
  }

  const result = await getPlayerConnectionMessages(connectionId);

  switch (result.kind) {
    case "ok":
      return {
        messages: result.messages.map((message) => toClientMessage(message, account.accountId)),
      };
    case "invalid-connection-id":
      return { fieldErrors: { connectionId: "Selecione uma conexão válida." } };
    case "not-authorized":
    case "connection-unavailable":
      return { error: "Não foi possível acessar as mensagens desta conexão." };
    case "error":
      return { error: "Não foi possível carregar as mensagens agora. Tente novamente." };
  }
}

export async function sendConnectionMessageAction(
  _previousState: PlayerMessagesActionState,
  formData: FormData,
): Promise<PlayerMessagesActionState> {
  const account = await requireAccount();

  if (account.accountType !== "PLAYER") {
    return { error: "Não foi possível enviar a mensagem." };
  }

  const allowedFields = new Set(["connectionId", "message"]);
  if ([...formData.keys()].some((key) => !allowedFields.has(key))) {
    return { error: "Não foi possível enviar a mensagem." };
  }

  const connectionIdValues = formData.getAll("connectionId");
  const messageValues = formData.getAll("message");
  if (
    connectionIdValues.length !== 1 ||
    typeof connectionIdValues[0] !== "string" ||
    !UUID_PATTERN.test(connectionIdValues[0])
  ) {
    return { fieldErrors: { connectionId: "Selecione uma conexão válida." } };
  }
  if (messageValues.length !== 1 || typeof messageValues[0] !== "string") {
    return { fieldErrors: { message: "Digite uma mensagem válida." } };
  }

  const result = await sendPlayerConnectionMessage(connectionIdValues[0], messageValues[0]);

  switch (result.kind) {
    case "created":
      return {
        success: "Mensagem enviada.",
        message: toClientMessage(result.message, account.accountId),
      };
    case "invalid-connection-id":
      return { fieldErrors: { connectionId: "Selecione uma conexão válida." } };
    case "invalid-message":
      return { fieldErrors: { message: "A mensagem deve ter entre 1 e 1000 caracteres." } };
    case "not-authorized":
    case "connection-unavailable":
      return { error: "Não foi possível enviar a mensagem." };
    case "error":
      return { error: "Não foi possível enviar a mensagem agora. Tente novamente." };
  }
}
