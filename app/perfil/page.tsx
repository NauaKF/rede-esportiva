import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAccount } from "@/lib/auth/require-account";
import { getPlayerProfile } from "@/lib/player/get-player-profile";
import { getPlayerAvailabilities, getPlayerAvailabilitySports } from "@/lib/player/availability";
import {
  getOwnedPlayerAvailabilityInterests,
  type OwnedPlayerAvailabilityInterest,
  type PlayerInterestRequestStatus,
} from "@/lib/player/get-availability-interests";
import { AvailabilityForm } from "./_components/AvailabilityForm";
import { CancelAvailabilityButton } from "./_components/CancelAvailabilityButton";
import { EditPlayerProfileForm } from "./_components/EditPlayerProfileForm";
import { InterestDecisionControls } from "./_components/InterestDecisionControls";

export const metadata: Metadata = {
  title: "Perfil do jogador | Rede Esportiva",
  description: "Perfil de jogador na Rede Esportiva.",
};

function formatAvailabilityDate(value: string, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone }).format(new Date(value));
  } catch {
    return value.slice(0, 10);
  }
}

function formatAvailabilityTime(value: string, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone,
    }).format(new Date(value));
  } catch {
    return value.slice(11, 16);
  }
}

function formatInterestDate(value: string, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone,
    }).format(new Date(value));
  } catch {
    return value;
  }
}

const interestStatusLabels: Record<PlayerInterestRequestStatus, string> = {
  PENDING: "Pendente",
  ACCEPTED: "Aceito",
  REJECTED: "Rejeitado",
  CANCELLED: "Cancelado",
};

export default async function PlayerProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ availability?: string }>;
}) {
  const { availability: availabilityResult } = await searchParams;
  const account = await requireAccount();

  if (account.accountType !== "PLAYER") redirect("/inicio");

  const profile = await getPlayerProfile(account.accountId);
  const availabilitySports = await getPlayerAvailabilitySports(account.accountId);
  const availabilities = await getPlayerAvailabilities(account.accountId);
  const interestsResult = availabilities.length > 0
    ? await getOwnedPlayerAvailabilityInterests()
    : null;
  const interestsByAvailability = new Map(
    interestsResult?.kind === "ok"
      ? interestsResult.availabilities.map(({ availabilityId, interests }) => [availabilityId, interests] as const)
      : [],
  );
  const interestsLoadFailed = interestsResult !== null && interestsResult.kind !== "ok";

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden bg-[#fbfaf6] text-[#182b24]">
      <header className="relative z-10 border-b border-[#182b24]/10 bg-[#fbfaf6]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/inicio" className="flex items-center gap-2.5" aria-label="Rede Esportiva, início">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#1f4d3a] text-lg text-white">r.</span>
            <span className="text-lg font-bold tracking-tight">Rede <span className="text-[#438260]">Esportiva</span></span>
          </Link>
          <span className="text-xs font-semibold uppercase tracking-[0.13em] text-[#758179]">Perfil do jogador</span>
        </div>
      </header>

      <div aria-hidden="true" className="pointer-events-none absolute -right-36 top-20 size-96 rounded-full bg-[#e3eddd] blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-28 size-96 rounded-full bg-[#f8e7d4] blur-3xl" />

      <section className="relative mx-auto w-full max-w-5xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
        {availabilityResult === "cancelled" && (
          <p role="status" className="mb-6 rounded-xl border border-[#b7cfba] bg-[#edf5eb] px-4 py-3 text-sm leading-5 text-[#30443a]">
            A disponibilidade foi cancelada.
          </p>
        )}
        {profile ? (
          <article className="rounded-3xl border border-[#e5e8de] bg-white p-6 shadow-[0_18px_55px_rgba(31,77,58,0.07)] sm:p-10">
            {account.status === "PENDING" && (
              <div role="status" className="mb-7 rounded-2xl border border-[#f0d4b8] bg-[#fff8ef] p-5">
                <h2 className="font-semibold text-[#70491f]">Sua conta aguarda aprovação</h2>
                <p className="mt-2 text-sm leading-6 text-[#785d3d]">Seu perfil está disponível, mas as funcionalidades completas ainda não estão liberadas.</p>
              </div>
            )}

            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#438260]">Perfil de jogador</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#182b24] sm:text-4xl">Seu perfil</h1>

            <section className="mt-7 border-b border-[#e7e9df] pb-8">
              <h2 className="text-lg font-semibold tracking-tight text-[#24382d]">Edite seu nome e sua bio</h2>
              <p className="mt-2 text-sm leading-6 text-[#64736b]">Essas informações ajudam outras pessoas a conhecer você.</p>
              <EditPlayerProfileForm name={profile.name} bio={profile.bio} />
            </section>

            <section className="mt-8 rounded-2xl border border-[#e7e9df] bg-[#fbfaf6] p-5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#758179]">Localização</h2>
              <p className="mt-2 text-sm font-medium text-[#30443a]">{profile.location.city}, {profile.location.regionCode}</p>
            </section>

            <section className="mt-8">
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#758179]">Modalidades</h2>
              {profile.sports.length > 0 ? (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {profile.sports.map((sport) => (
                    <li key={sport.name} className="rounded-2xl border border-[#e7e9df] bg-white p-5">
                      <span className="block font-semibold text-[#30443a]">{sport.name}</span>
                      {sport.level && <span className="mt-1 block text-sm text-[#758179]">Nível: {sport.level}</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 rounded-2xl border border-[#e7e9df] bg-[#fbfaf6] p-5 text-sm leading-6 text-[#64736b]">Nenhuma modalidade foi informada no perfil.</p>
              )}
            </section>
          </article>
        ) : (
          <div className="rounded-3xl border border-[#e5e8de] bg-white p-6 shadow-[0_18px_55px_rgba(31,77,58,0.07)] sm:p-10">
            {account.status === "PENDING" && (
              <div role="status" className="mb-7 rounded-2xl border border-[#f0d4b8] bg-[#fff8ef] p-5">
                <h2 className="font-semibold text-[#70491f]">Sua conta aguarda aprovação</h2>
                <p className="mt-2 text-sm leading-6 text-[#785d3d]">As funcionalidades completas ainda não estão disponíveis.</p>
              </div>
            )}
            <h1 className="text-2xl font-semibold tracking-[-0.035em] text-[#182b24]">Não encontramos seu perfil</h1>
            <p className="mt-3 text-sm leading-6 text-[#64736b]">Não foi possível localizar os dados do perfil de jogador. Tente novamente mais tarde.</p>
            <Link href="/inicio" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#1f4d3a] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#173b2c]">Voltar ao início</Link>
          </div>
        )}
        {account.accountType === "PLAYER" && (
          <>
            <section className="mt-8 rounded-3xl border border-[#e5e8de] bg-white p-6 shadow-[0_18px_55px_rgba(31,77,58,0.07)] sm:p-10">
              <h2 className="text-lg font-semibold tracking-tight text-[#24382d]">Publique sua disponibilidade</h2>
              <AvailabilityForm sports={availabilitySports} />
            </section>

            <section className="mt-8 rounded-3xl border border-[#e5e8de] bg-white p-6 shadow-[0_18px_55px_rgba(31,77,58,0.07)] sm:p-10">
              <h2 className="text-lg font-semibold tracking-tight text-[#24382d]">Suas disponibilidades publicadas</h2>
              {availabilities.length > 0 ? (
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {availabilities.map((availability) => {
                    const interests: OwnedPlayerAvailabilityInterest[] = interestsByAvailability.get(availability.id) ?? [];

                    return (
                    <li key={availability.id} className="rounded-2xl border border-[#e7e9df] bg-[#fbfaf6] p-5">
                      <h3 className="font-semibold text-[#30443a]">{availability.sportName}</h3>
                      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <dt className="text-[#758179]">Data</dt>
                        <dd className="text-right text-[#30443a]">{formatAvailabilityDate(availability.startsAt, availability.timeZone)}</dd>
                        <dt className="text-[#758179]">Início</dt>
                        <dd className="text-right text-[#30443a]">{formatAvailabilityTime(availability.startsAt, availability.timeZone)}</dd>
                        <dt className="text-[#758179]">Término</dt>
                        <dd className="text-right text-[#30443a]">{formatAvailabilityTime(availability.endsAt, availability.timeZone)}</dd>
                        <dt className="text-[#758179]">Fuso horário</dt>
                        <dd className="break-words text-right text-[#30443a]">{availability.timeZone}</dd>
                      </dl>
                      <CancelAvailabilityButton availabilityId={availability.id} />

                      <section className="mt-5 border-t border-[#e7e9df] pt-4">
                        <h4 className="text-sm font-semibold text-[#30443a]">Interessados</h4>
                        {interestsLoadFailed ? (
                          <p role="alert" className="mt-2 text-sm text-[#9e3c2c]">
                            Não foi possível carregar os interessados agora. Tente novamente mais tarde.
                          </p>
                        ) : interests.length === 0 ? (
                          <p className="mt-2 text-sm text-[#758179]">Ainda não há interessados nesta disponibilidade.</p>
                        ) : (
                          <ul className="mt-3 space-y-3">
                            {interests.map((interest) => {
                              const pending = interest.status === "PENDING";

                              return (
                                <li
                                  key={interest.requestId}
                                  className={`rounded-xl border p-4 ${pending ? "border-[#f0d4b8] bg-[#fff8ef]" : "border-[#e7e9df] bg-white"}`}
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h5 className="font-semibold text-[#30443a]">{interest.name}</h5>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pending ? "bg-[#f8eadb] text-[#785d3d]" : "bg-[#edf5eb] text-[#38704f]"}`}>
                                      {interestStatusLabels[interest.status]}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-sm text-[#64736b]">
                                    {interest.sport} · {interest.city}, {interest.region}
                                  </p>
                                  <p className="mt-2 text-xs text-[#758179]">
                                    Demonstrou interesse em {formatInterestDate(interest.createdAt, availability.timeZone)}
                                  </p>
                                  {pending && (
                                    <InterestDecisionControls requestId={interest.requestId} />
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </section>
                    </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-4 rounded-2xl border border-[#e7e9df] bg-[#fbfaf6] p-5 text-sm leading-6 text-[#64736b]">
                  Você ainda não publicou disponibilidades.
                </p>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
}
