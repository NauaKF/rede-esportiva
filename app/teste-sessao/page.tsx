import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

export const metadata: Metadata = {
  title: "Teste de sessão | Rede Esportiva",
  description: "Visualização temporária dos dados básicos da sessão autenticada.",
};

export default async function SessionTestPage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="flex flex-1 flex-col bg-[#fbfaf6] text-[#182b24]">
      <header className="border-b border-[#182b24]/10">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Rede Esportiva, início">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#1f4d3a] text-lg text-white">r.</span>
            <span className="text-lg font-bold tracking-tight">Rede <span className="text-[#438260]">Esportiva</span></span>
          </Link>
          <span className="text-xs font-semibold uppercase tracking-[0.13em] text-[#758179]">Área de teste</span>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-5xl flex-1 items-center px-5 py-14 sm:px-8 sm:py-20">
        <div className="w-full rounded-3xl border border-[#e5e8de] bg-white p-6 shadow-[0_18px_55px_rgba(31,77,58,0.07)] sm:p-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#dce9de] bg-[#f7faf5] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.13em] text-[#38704f]">
            <span className={`size-2 rounded-full ${session ? "bg-[#438260]" : "bg-[#ef9c55]"}`} />
            Sessão autenticada
          </span>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Teste de sessão</h1>

          {session ? (
            <dl className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#e7e9df] bg-[#fbfaf6] p-5 sm:col-span-3">
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#758179]">ID da conta</dt>
                <dd className="mt-2 break-all font-mono text-sm text-[#24382d]">{session.user.accountId}</dd>
              </div>
              <div className="rounded-2xl border border-[#e7e9df] bg-[#fbfaf6] p-5">
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#758179]">Tipo de conta</dt>
                <dd className="mt-2 text-base font-semibold text-[#24382d]">{session.user.accountType}</dd>
              </div>
              <div className="rounded-2xl border border-[#e7e9df] bg-[#fbfaf6] p-5">
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[#758179]">Status</dt>
                <dd className="mt-2 text-base font-semibold text-[#24382d]">{session.user.status}</dd>
              </div>
            </dl>
          ) : (
            <div className="mt-8 rounded-2xl border border-[#e7e9df] bg-[#fbfaf6] p-5 sm:p-6">
              <p className="text-sm leading-6 text-[#64736b]">Você não está autenticado. Entre na sua conta para consultar os dados básicos da sessão.</p>
              <Link href="/login" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#1f4d3a] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#173b2c]">
                Ir para o login
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
