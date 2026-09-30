import Link from "next/link";

const options = [
  {
    title: "Quero jogar",
    description: "Encontre pessoas para jogar e organize seu perfil esportivo.",
    href: "/cadastro/jogador",
    icon: "🎾",
    label: "Criar perfil de jogador",
  },
  {
    title: "Tenho uma arena",
    description: "Apresente seu espaço e conecte sua arena a novos jogadores.",
    href: "/cadastro/arena",
    icon: "🏟️",
    label: "Cadastrar minha arena",
  },
];

export default function RegistrationPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf6] px-5 py-12 text-[#24382d] sm:px-8 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm font-bold tracking-tight text-[#24382d]">
          Rede <span className="text-[#438260]">Esportiva</span>
        </Link>
        <div className="mx-auto mt-12 max-w-2xl text-center sm:mt-16">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#438260]">Vamos começar</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">Faça parte da Rede Esportiva</h1>
          <p className="mt-4 text-base leading-7 text-[#64736b]">Escolha como você quer participar. Leva só alguns minutos para criar seu perfil.</p>
        </div>
        <div className="mt-9 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6">
          {options.map((option) => (
            <article key={option.href} className="flex flex-col rounded-3xl border border-[#e5e8de] bg-white p-6 shadow-sm sm:p-8">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-[#f5f3e9] text-3xl" aria-hidden="true">{option.icon}</span>
              <h2 className="mt-6 text-xl font-semibold">{option.title}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-[#64736b]">{option.description}</p>
              <Link href={option.href} className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-[#1f4d3a] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#173b2c]">
                {option.label}
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-[#758179]">Já tem uma conta? <span className="font-semibold text-[#438260]">O acesso estará disponível em breve.</span></p>
      </div>
    </main>
  );
}
