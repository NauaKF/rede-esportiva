import Link from "next/link";
import { LoginForm } from "./_components/LoginForm";

export const metadata = {
  title: "Entrar | Rede Esportiva",
  description: "Acesse sua conta na Rede Esportiva.",
};

export default function LoginPage() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden bg-[#fbfaf6] text-[#182b24]">
      <header className="relative z-10 border-b border-[#182b24]/10">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Rede Esportiva, início">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#1f4d3a] text-lg text-white">r.</span>
            <span className="text-lg font-bold tracking-tight">Rede <span className="text-[#438260]">Esportiva</span></span>
          </Link>
          <Link href="/cadastro" className="rounded-full px-4 py-2 text-sm font-semibold text-[#30443a] transition-colors hover:bg-[#1f4d3a]/5">
            Criar conta
          </Link>
        </div>
      </header>

      <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-24 size-96 rounded-full bg-[#e3eddd] blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-28 size-96 rounded-full bg-[#f8e7d4] blur-3xl" />

      <section className="relative mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_0.82fr] lg:gap-20 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#dce9de] bg-white/70 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.13em] text-[#38704f]">
            <span className="size-2 rounded-full bg-[#ef9c55]" />
            Bom ter você por aqui
          </div>
          <h1 className="text-4xl font-semibold tracking-[-0.045em] text-[#182b24] sm:text-5xl">Entre na sua rede.</h1>
          <p className="mt-4 text-base leading-7 text-[#64736b]">Acesse sua conta e fique mais perto do próximo jogo.</p>

          <LoginForm />

          <p className="mt-7 text-center text-sm text-[#64736b]">
            Ainda não tem uma conta?{" "}
            <Link href="/cadastro" className="font-semibold text-[#38704f] underline-offset-4 hover:underline">Cadastre-se</Link>
          </p>
        </div>

        <aside className="relative hidden min-h-[430px] items-center justify-center lg:flex" aria-label="Encontre seu próximo jogo">
          <div className="absolute size-[26rem] rounded-full bg-[#e6efe4]" />
          <div className="absolute size-[21rem] rounded-full border border-white/80" />
          <div className="absolute size-[15rem] rounded-full border border-white/80" />
          <div className="relative w-full max-w-md rotate-[-5deg] rounded-[2rem] border-[3px] border-white bg-[#47805c] p-6 shadow-[0_24px_80px_rgba(31,77,58,0.2)]">
            <div className="relative aspect-[1.15] border-2 border-white/75">
              <div className="absolute inset-y-0 left-1/2 border-l-2 border-white/75" />
              <div className="absolute inset-x-0 top-1/2 border-t-[3px] border-[#f7f1dd]" />
              <div className="absolute inset-x-0 top-[32%] border-t-2 border-white/75" />
              <div className="absolute inset-x-0 bottom-[32%] border-t-2 border-white/75" />
              <div className="absolute inset-y-[32%] left-[22%] right-[22%] border-2 border-white/75" />
            </div>
          </div>
          <div className="absolute left-2 top-14 rounded-2xl border border-[#e7ede5] bg-white/95 px-5 py-4 shadow-lg backdrop-blur">
            <span className="block text-xs font-medium text-[#758179]">Seu esporte, sua galera</span>
            <span className="mt-1 block text-sm font-bold text-[#30443a]">A próxima partida está perto.</span>
          </div>
          <div className="absolute bottom-14 right-0 rounded-2xl border border-white/80 bg-white/95 px-5 py-4 shadow-lg backdrop-blur">
            <span className="flex items-center gap-3 text-sm font-semibold text-[#30443a]"><span className="flex size-9 items-center justify-center rounded-full bg-[#f8eadb]">🎾</span> Bora marcar um jogo?</span>
          </div>
        </aside>
      </section>
    </main>
  );
}
