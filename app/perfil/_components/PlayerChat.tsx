"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import {
  getConnectionMessagesAction,
  sendConnectionMessageAction,
  type ChatMessageForClient,
  type PlayerMessagesActionState,
} from "../message-actions";

type PlayerChatProps = {
  connectionId: string;
  otherPlayerName: string;
};

type MessageLoadState = "loading" | "loaded" | "error";

const initialActionState: PlayerMessagesActionState = {};
const MAX_MESSAGE_LENGTH = 1000;

function sortMessages(messages: ChatMessageForClient[]): ChatMessageForClient[] {
  return [...messages].sort((first, second) => {
    const dateOrder = Date.parse(first.createdAt) - Date.parse(second.createdAt);
    return dateOrder || first.id.localeCompare(second.id);
  });
}

function formatMessageTime(value: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    }).format(new Date(value));
  } catch {
    return "Horário indisponível";
  }
}

export function PlayerChat({ connectionId, otherPlayerName }: PlayerChatProps) {
  const [messages, setMessages] = useState<ChatMessageForClient[]>([]);
  const [loadState, setLoadState] = useState<MessageLoadState>("loading");
  const [draft, setDraft] = useState("");
  const [sendState, formAction, isPending] = useActionState(
    sendConnectionMessageAction,
    initialActionState,
  );
  const textareaId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastHandledMessageId = useRef<string | null>(null);
  const submittedConnectionId = useRef<string | null>(null);
  const characterCount = Array.from(draft).length;

  useEffect(() => {
    let active = true;
    setMessages([]);
    setLoadState("loading");

    getConnectionMessagesAction(connectionId)
      .then((result) => {
        if (!active) return;
        if (result.error || !result.messages) {
          setLoadState("error");
          return;
        }
        setMessages(sortMessages(result.messages));
        setLoadState("loaded");
      })
      .catch(() => {
        if (active) setLoadState("error");
      });

    return () => {
      active = false;
    };
  }, [connectionId]);

  useEffect(() => {
    const sentMessage = sendState.message;
    if (
      !sentMessage ||
      submittedConnectionId.current !== connectionId ||
      lastHandledMessageId.current === sentMessage.id
    ) {
      return;
    }

    lastHandledMessageId.current = sentMessage.id;
    setMessages((current) => sortMessages([
      ...current.filter((message) => message.id !== sentMessage.id),
      sentMessage,
    ]));
    setDraft("");
  }, [connectionId, sendState.message]);

  const messageError = sendState.fieldErrors?.message;
  const actionError = sendState.error ?? messageError ?? sendState.fieldErrors?.connectionId;
  const canSubmit =
    loadState !== "loading" &&
    !isPending &&
    characterCount > 0 &&
    characterCount <= MAX_MESSAGE_LENGTH;

  return (
    <section className="rounded-2xl border border-[#e7e9df] bg-white p-5">
      <h3 className="text-base font-semibold text-[#30443a]">Conversa com {otherPlayerName}</h3>

      <div className="mt-4 min-h-24" aria-live="polite">
        {loadState === "loading" && (
          <p role="status" className="text-sm text-[#64736b]">Carregando mensagens…</p>
        )}

        {loadState === "error" && (
          <p role="alert" aria-live="assertive" className="text-sm text-[#9e3c2c]">
            Não foi possível carregar as mensagens. Tente novamente mais tarde.
          </p>
        )}

        {loadState === "loaded" && messages.length === 0 && (
          <p role="status" className="text-sm text-[#64736b]">Ainda não há mensagens nesta conversa.</p>
        )}

        {loadState === "loaded" && messages.length > 0 && (
          <ol className="space-y-3">
            {messages.map((message) => (
              <li
                key={message.id}
                className={`flex ${message.isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <article
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.isOwnMessage
                      ? "bg-[#1f4d3a] text-white"
                      : "border border-[#e7e9df] bg-[#fbfaf6] text-[#30443a]"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words text-sm">{message.message}</p>
                  <time
                    dateTime={message.createdAt}
                    className={`mt-2 block text-right text-xs ${
                      message.isOwnMessage ? "text-white/75" : "text-[#758179]"
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </time>
                </article>
              </li>
            ))}
          </ol>
        )}
      </div>

      <form
        action={formAction}
        onSubmit={() => {
          submittedConnectionId.current = connectionId;
        }}
        aria-busy={isPending}
        className="mt-5 border-t border-[#e7e9df] pt-4"
      >
        <input type="hidden" name="connectionId" value={connectionId} />
        <label htmlFor={textareaId} className="block text-sm font-medium text-[#30443a]">
          Sua mensagem
        </label>
        <textarea
          ref={textareaRef}
          id={textareaId}
          name="message"
          value={draft}
          onChange={(event) => {
            const nextDraft = event.currentTarget.value;
            if (Array.from(nextDraft).length <= MAX_MESSAGE_LENGTH) setDraft(nextDraft);
          }}
          maxLength={MAX_MESSAGE_LENGTH * 2}
          rows={3}
          disabled={isPending || loadState === "loading"}
          aria-describedby={`${textareaId}-counter${messageError ? ` ${textareaId}-error` : ""}`}
          className="mt-2 block w-full resize-y rounded-xl border border-[#d9dfd5] bg-white px-3 py-2.5 text-sm text-[#24382d] outline-none transition focus:border-[#438260] focus:ring-2 focus:ring-[#438260]/20 disabled:cursor-not-allowed disabled:bg-[#f4f5f1]"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <p id={`${textareaId}-counter`} className="text-xs text-[#758179]" aria-live="polite">
            {characterCount}/{MAX_MESSAGE_LENGTH} caracteres
          </p>
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#1f4d3a] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#173b2c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#438260] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Enviando…" : "Enviar"}
          </button>
        </div>

        {isPending && (
          <p role="status" className="mt-2 text-sm text-[#64736b]">Enviando mensagem…</p>
        )}
        {!isPending && sendState.success && (
          <p role="status" aria-live="polite" className="mt-2 text-sm text-[#38704f]">
            {sendState.success}
          </p>
        )}
        {!isPending && actionError && (
          <p id={`${textareaId}-error`} role="alert" aria-live="assertive" className="mt-2 text-sm text-[#9e3c2c]">
            {actionError}
          </p>
        )}
      </form>
    </section>
  );
}
