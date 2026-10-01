import type { Metadata } from "next";
import Link from "next/link";
import { requireAccount } from "@/lib/auth/require-account";

export const metadata: Metadata = {
  title: "Início | Rede Esportiva",
  description: "Sua conta na Rede Esportiva.",
};

export default async function InicioPage() {
  const account = await requireAccount();

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden bg-[#fbfaf6] text-[#182b24]">
      <header className="relative z-10 border-b border-[#182b24]/10 bg-[#fbfaf6]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Rede Esportiva, início">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#1f4d3a] text-lg text-white">r.</span>
            <span className="text-lg font-bold tracking-tight">Rede <span className="text-[#438260]">Esportiva</span></span>
          </Link>
          <span className="text-xs font-semibold uppercase tracking-[0.13em] text-[#758179]">Minha conta</span>
        </div>
      </header>

      <div aria-hidden="true" className="pointer-events-none absolute -right-36 top-20 size-96 rounded-full bg-[#e3eddd] blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-28 size-96 rounded-full bg-[#f8e7d4] blur-3xl" />

      <section className="relative mx-auto flex w-full max-w-5xl flex-1 items-center px-5 py-14 sm:px-8 sm:py-20">
        <div className="w-full rounded-3xl border border-[#e5e8de] bg-white p-6 shadow-[0_18px_55px_rgba(31,77,58,0.07)] sm:p-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#dce9de] bg-[#f7faf5] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.13em] text-[#38704f]">
            <span className={`size-2 rounded-full ${account.status === "ACTIVE" ? "bg-[#438260]" : "bg-[#ef9c55]"}`} />
            Área da conta
          </span>

          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Boas-vindas à Rede Esportiva!</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#64736b]">Que bom ter você por aqui. Confira abaixo as informações atuais da sua conta.</p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#e7e9df] bg-[#fbfaf6] p-5">
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#758179]">Tipo de conta</dt>
              <dd className="mt-2 text-base font-semibold text-[#24382d]">{account.accountType}</dd>
            </div>
            <div className="rounded-2xl border border-[#e7e9df] bg-[#fbfaf6] p-5">
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#758179]">Status atual</dt>
              <dd className="mt-2 text-base font-semibold text-[#24382d]">{account.status}</dd>
            </div>
          </dl>

          {account.status === "PENDING" ? (
            <div role="status" className="mt-6 rounded-2xl border border-[#f0d4b8] bg-[#fff8ef] p-5 sm:p-6">
              <h2 className="font-semibold text-[#70491f]">Sua conta aguarda aprovação</h2>
              <p className="mt-2 text-sm leading-6 text-[#785d3d]">Enquanto a aprovação não for concluída, as funcionalidades completas da Rede Esportiva ainda não estão disponíveis.</p>
            </div>
          ) : (
            <div role="status" className="mt-6 rounded-2xl border border-[#b7cfba] bg-[#edf5eb] p-5 sm:p-6">
              <h2 className="font-semibold text-[#30443a]">Sua conta está ativa</h2>
              <p className="mt-2 text-sm leading-6 text-[#53655c]">Sua conta está ativa na Rede Esportiva.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
