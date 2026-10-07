"use client";

import { useState } from "react";
import { PlayerChat } from "@/app/perfil/_components/PlayerChat";

type PlayerConnectionChatOption = {
  connectionId: string;
  otherPlayerName: string;
  sportName: string;
};

type PlayerConnectionChatSelectorProps = {
  connections: PlayerConnectionChatOption[];
};

export function PlayerConnectionChatSelector({
  connections,
}: PlayerConnectionChatSelectorProps) {
  const [selectedConnectionId, setSelectedConnectionId] = useState("");
  const selectedConnection = connections.find(
    (connection) => connection.connectionId === selectedConnectionId,
  );

  return (
    <div className="mt-6 border-t border-[#e7e9df] pt-5">
      <label
        htmlFor="player-connection-chat-select"
        className="block text-sm font-medium text-[#30443a]"
      >
        Escolha uma conexão para abrir a conversa
      </label>
      <select
        id="player-connection-chat-select"
        value={selectedConnectionId}
        onChange={(event) => setSelectedConnectionId(event.currentTarget.value)}
        className="mt-2 block w-full rounded-xl border border-[#d9dfd5] bg-white px-3 py-2.5 text-sm text-[#24382d] outline-none transition focus:border-[#438260] focus:ring-2 focus:ring-[#438260]/20"
      >
        <option value="">Selecione uma conexão</option>
        {connections.map((connection) => (
          <option key={connection.connectionId} value={connection.connectionId}>
            {connection.otherPlayerName} · {connection.sportName}
          </option>
        ))}
      </select>

      {selectedConnection && (
        <div className="mt-5">
          <PlayerChat
            key={selectedConnection.connectionId}
            connectionId={selectedConnection.connectionId}
            otherPlayerName={selectedConnection.otherPlayerName}
          />
        </div>
      )}
    </div>
  );
}
