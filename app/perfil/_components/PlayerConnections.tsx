import type {
  GetPlayerConnectionsResult,
  PlayerConnection,
} from "@/lib/player/get-player-connections";

type RenderablePlayerConnectionsResult =
  | Extract<GetPlayerConnectionsResult, { kind: "ok" }>
  | Extract<GetPlayerConnectionsResult, { kind: "error" }>;

type PlayerConnectionsProps = {
  result: RenderablePlayerConnectionsResult;
};

function formatConnectedAt(value: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    }).format(new Date(value));
  } catch {
    return "Data indisponível";
  }
}

function ConnectionCard({ connection }: { connection: PlayerConnection }) {
  return (
    <li className="rounded-2xl border border-[#e7e9df] bg-[#fbfaf6] p-5">
      <h3 className="font-semibold text-[#30443a]">{connection.otherPlayerName}</h3>
      <p className="mt-1 text-sm text-[#64736b]">
        {connection.sportName} · {connection.city}, {connection.region}
      </p>
      <p className="mt-3 text-xs text-[#758179]">
        Conexão criada em{" "}
        <time dateTime={connection.connectedAt}>{formatConnectedAt(connection.connectedAt)}</time>
      </p>
    </li>
  );
}

export function PlayerConnections({ result }: PlayerConnectionsProps) {
  return (
    <section className="mt-8 rounded-3xl border border-[#e5e8de] bg-white p-6 shadow-[0_18px_55px_rgba(31,77,58,0.07)] sm:p-10">
      <h2 className="text-lg font-semibold tracking-tight text-[#24382d]">Minhas conexões</h2>

      {result.kind === "error" ? (
        <p role="alert" className="mt-4 rounded-2xl border border-[#edc7bc] bg-[#fff3ef] p-5 text-sm leading-6 text-[#9e3c2c]">
          Não foi possível carregar suas conexões.
        </p>
      ) : result.connections.length === 0 ? (
        <p role="status" className="mt-4 rounded-2xl border border-[#e7e9df] bg-[#fbfaf6] p-5 text-sm leading-6 text-[#64736b]">
          Você ainda não possui conexões.
        </p>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {result.connections.map((connection) => (
            <ConnectionCard key={connection.connectionId} connection={connection} />
          ))}
        </ul>
      )}
    </section>
  );
}
