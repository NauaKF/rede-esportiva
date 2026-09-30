import Link from "next/link";
import { getSportsCatalog } from "@/lib/registration/create-account";
import { ArenaRegistrationForm } from "../_components/ArenaRegistrationForm";

export const dynamic = "force-dynamic";

export default async function ArenaRegistrationPage() {
  const sports = await getSportsCatalog();

  return (
    <main className="min-h-screen bg-[#fbfaf6] px-5 py-8 text-[#24382d] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/cadastro" className="text-sm font-semibold text-[#438260] hover:text-[#1f4d3a]">← Voltar à escolha de cadastro</Link>
        <div className="mt-8 rounded-3xl border border-[#e5e8de] bg-white p-5 shadow-sm sm:mt-10 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#438260]">Perfil de arena</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Cadastre seu espaço esportivo</h1>
          <p className="mt-3 text-sm leading-6 text-[#64736b]">Apresente sua arena, localização e modalidades disponíveis. Seu cadastro ficará pendente enquanto preparamos o acesso.</p>
          <ArenaRegistrationForm sports={sports} />
        </div>
      </div>
    </main>
  );
}
