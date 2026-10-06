import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAccount } from "@/lib/auth/require-account";
import { getPlayerProfile } from "@/lib/player/get-player-profile";
import {
  getRegionalPlayerAvailabilityBoard,
  getSearchableSports,
  type RegionalPlayerAvailability,
  type SearchableSport,
} from "@/lib/player/search-player-availabilities";
import { PlayerSearchFilters } from "./_components/PlayerSearchFilters";
import { PlayerInterestButton } from "./_components/PlayerInterestButton";

export const metadata: Metadata = {
  title: "Pessoas disponíveis para jogar | Rede Esportiva",
  description: "Veja quem está disponível para jogar na sua região.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function formatAvailabilityDateTime(value: string, timeZone: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(new Date(value));
}

export default async function PlayersBoardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const account = await requireAccount();
  if (account.accountType !== "PLAYER") redirect("/inicio");

  const profile = await getPlayerProfile(account.accountId);
  const city = profile?.location.city.trim() ?? "";
  const region = profile?.location.regionCode.trim() ?? "";

  return (
    <main className="min-h-full flex-1 bg-[#fbfaf6] px-5 py-10 text-[#182b24] sm:px-8 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between">
          <Link href="/inicio" className="flex items-center gap-2.5" aria-label="Rede Esportiva, início">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#1f4d3a] text-lg text-white">r.</span>
            <span className="text-lg font-bold tracking-tight">Rede <span className="text-[#438260]">Esportiva</span></span>
          </Link>
          <Link href="/perfil" className="text-sm font-semibold text-[#38704f] hover:text-[#1f4d3a]">Meu perfil</Link>
        </header>

        <section className="rounded-3xl border border-[#e5e8de] bg-white p-6 shadow-[0_18px_55px_rgba(31,77,58,0.07)] sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#438260]">Mural da sua região</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#182b24]">Pessoas disponíveis para jogar</h1>

          {!profile || !city || !region ? (
            <div role="status" className="mt-6 rounded-2xl border border-[#f0d4b8] bg-[#fff8ef] p-5">
              <p className="text-sm leading-6 text-[#785d3d]">
                Para ver pessoas disponíveis perto de você, complete a cidade e a região do seu perfil.
              </p>
              <Link href="/perfil" className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full bg-[#1f4d3a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#173b2c]">
                Completar meu perfil
              </Link>
            </div>
          ) : (
            <RegionalBoard city={city} region={region} accountId={account.accountId} searchParams={searchParams} />
          )}
        </section>
      </div>
    </main>
  );
}

async function RegionalBoard({
  city,
  region,
  accountId,
  searchParams,
}: {
  city: string;
  region: string;
  accountId: string;
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const rawSportId = params.sportId;
  const duplicateSportFilter = Array.isArray(rawSportId);
  const selectedSportId = typeof rawSportId === "string" ? rawSportId.trim() : "";

  let sports: SearchableSport[] = [];
  let results: RegionalPlayerAvailability[] = [];
  let loadError = false;
  let sportFilterError = duplicateSportFilter;

  try {
    sports = await getSearchableSports();

    let sportId: number | undefined;
    if (selectedSportId) {
      const parsedSportId = /^\d+$/.test(selectedSportId) ? Number(selectedSportId) : NaN;
      if (!Number.isSafeInteger(parsedSportId) || !sports.some((sport) => sport.id === parsedSportId)) {
        sportFilterError = true;
      } else {
        sportId = parsedSportId;
      }
    }

    if (!sportFilterError) {
      results = await getRegionalPlayerAvailabilityBoard({
        city,
        region,
        excludeAccountId: accountId,
        sportId,
      });
    }
  } catch {
    loadError = true;
  }

  return (
    <>
      <p className="mt-3 text-sm text-[#64736b]">Disponibilidades futuras em <span className="font-semibold text-[#30443a]">{city}, {region}</span></p>
      <PlayerSearchFilters sports={sports} sportId={sportFilterError ? "" : selectedSportId} />

      {sportFilterError && (
        <p role="alert" className="mt-5 rounded-xl border border-[#edc7bc] bg-[#fff3ef] px-4 py-3 text-sm text-[#9e3c2c]">
          Selecione um esporte ativo válido.
        </p>
      )}
      {loadError && (
        <p role="alert" className="mt-5 rounded-xl border border-[#edc7bc] bg-[#fff3ef] px-4 py-3 text-sm text-[#9e3c2c]">
          Não foi possível carregar o mural agora. Tente novamente.
        </p>
      )}
      {!sportFilterError && !loadError && results.length === 0 && (
        <p role="status" className="mt-7 rounded-2xl border border-[#e7e9df] bg-[#fbfaf6] p-5 text-sm leading-6 text-[#64736b]">
          Ainda não há pessoas com disponibilidade futura nessa região. Volte mais tarde ou escolha outro esporte.
        </p>
      )}

      {results.length > 0 && (
        <ul className="mt-7 grid gap-4 sm:grid-cols-2">
          {results.map((result) => (
            <li key={result.availabilityId} className="rounded-2xl border border-[#e7e9df] bg-[#fbfaf6] p-5">
              <p className="text-sm font-semibold text-[#438260]">{result.sport}</p>
              <h2 className="mt-1 text-lg font-semibold text-[#24382d]">{result.name}</h2>
              <p className="mt-1 text-sm text-[#64736b]">{result.city}, {result.region}</p>
              <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-[#758179]">Data e início</dt>
                <dd className="text-right font-medium text-[#30443a]">
                  <time dateTime={result.startsAt}>{formatAvailabilityDateTime(result.startsAt, result.timeZone)}</time>
                </dd>
                <dt className="text-[#758179]">Término</dt>
                <dd className="text-right text-[#30443a]">
                  <time dateTime={result.endsAt}>{formatAvailabilityDateTime(result.endsAt, result.timeZone)}</time>
                </dd>
              </dl>
              <PlayerInterestButton
                availabilityId={result.availabilityId}
                hasInterest={result.hasInterest}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
