import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAccount } from "@/lib/auth/require-account";
import { getPlayerProfile } from "@/lib/player/get-player-profile";

export const metadata: Metadata = {
  title: "Perfil do jogador | Rede Esportiva",
  description: "Perfil de jogador na Rede Esportiva.",
};

export default async function PlayerProfilePage() {
  const account = await requireAccount();

  if (account.accountType !== "PLAYER") redirect("/inicio");

  const profile = await getPlayerProfile(account.accountId);

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
        {profile ? (
          <article className="rounded-3xl border border-[#e5e8de] bg-white p-6 shadow-[0_18px_55px_rgba(31,77,58,0.07)] sm:p-10">
            {account.status === "PENDING" && (
              <div role="status" className="mb-7 rounded-2xl border border-[#f0d4b8] bg-[#fff8ef] p-5">
                <h2 className="font-semibold text-[#70491f]">Sua conta aguarda aprovação</h2>
                <p className="mt-2 text-sm leading-6 text-[#785d3d]">Seu perfil está disponível, mas as funcionalidades completas ainda não estão liberadas.</p>
              </div>
            )}

            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#438260]">Perfil de jogador</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#182b24] sm:text-4xl">{profile.name}</h1>

            {profile.bio && (
              <section className="mt-8">
                <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#758179]">Sobre</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#53655c]">{profile.bio}</p>
              </section>
            )}

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
      </section>
    </main>
  );
}
