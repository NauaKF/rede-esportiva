const steps = [
  {
    number: "01",
    title: "Crie seu perfil",
    description:
      "Conte quais esportes você pratica, seu nível e onde costuma jogar.",
  },
  {
    number: "02",
    title: "Informe quando está disponível",
    description:
      "Escolha os dias e horários que funcionam para você e deixe a rede fazer o resto.",
  },
  {
    number: "03",
    title: "Encontre jogadores e uma arena",
    description:
      "Combine com pessoas do seu ritmo e descubra lugares para jogar por perto.",
  },
];

const sports = [
  { emoji: "🎾", name: "Tênis", detail: "Encontre sua próxima dupla" },
  { emoji: "🏖️", name: "Beach Tennis", detail: "Jogue na areia" },
  { emoji: "🏐", name: "Vôlei", detail: "Monte seu time" },
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-[#fbfaf6] text-[#182b24]">
      <header className="relative z-10 border-b border-[#182b24]/10 bg-[#fbfaf6]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-4 px-5 py-4 sm:px-8 lg:flex-nowrap lg:px-12">
          <a href="#inicio" className="flex shrink-0 items-center gap-2.5" aria-label="Rede Esportiva, início">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#1f4d3a] text-lg text-white">r.</span>
            <span className="text-lg font-bold tracking-tight">Rede <span className="text-[#438260]">Esportiva</span></span>
          </a>

          <nav aria-label="Navegação principal" className="order-3 flex w-full items-center justify-center gap-6 text-sm font-medium text-[#53655c] sm:gap-9 lg:order-none lg:w-auto">
            <a className="transition-colors hover:text-[#1f4d3a]" href="#inicio">Início</a>
            <a className="transition-colors hover:text-[#1f4d3a]" href="#como-funciona">Como funciona</a>
            <a className="transition-colors hover:text-[#1f4d3a]" href="#modalidades">Modalidades</a>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <a href="#comecar" className="rounded-full px-3 py-2 text-sm font-semibold text-[#30443a] transition-colors hover:bg-[#1f4d3a]/5 sm:px-4">Entrar</a>
            <a href="#comecar" className="rounded-full bg-[#1f4d3a] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#173b2c] sm:px-5">Criar conta</a>
          </div>
        </div>
      </header>

      <section id="inicio" className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:px-12 lg:pb-28 lg:pt-24">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#dce9de] bg-white/70 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.13em] text-[#38704f]">
            <span className="size-2 rounded-full bg-[#ef9c55]" />
            Seu próximo jogo começa aqui
          </div>
          <h1 className="text-[2.75rem] leading-[1.08] font-semibold tracking-[-0.045em] text-[#182b24] sm:text-6xl lg:text-[4.25rem]">
            Mais jogo. <span className="text-[#438260]">Mais gente.</span><br className="hidden sm:block" /> Mais perto.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#64736b] sm:text-lg sm:leading-8">
            Encontre jogadores com a sua vibe e arenas disponíveis para tênis, beach tennis e vôlei. Do convite à quadra, tudo fica mais fácil quando o jogo conecta.
          </p>
          <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
            <a href="#comecar" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#ef9c55] px-6 py-3 text-sm font-bold text-[#292d24] shadow-[0_8px_24px_rgba(239,156,85,0.22)] transition-transform hover:-translate-y-0.5 hover:bg-[#f2a96b]">
              Encontrar jogadores <span aria-hidden="true">→</span>
            </a>
            <a href="#comecar" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#cdd8cf] bg-white/60 px-6 py-3 text-sm font-semibold text-[#30443a] transition-colors hover:border-[#1f4d3a] hover:bg-white">
              Sou uma arena
            </a>
          </div>
          <div className="mt-9 flex items-center gap-3 text-sm text-[#64736b]">
            <div className="flex -space-x-2" aria-hidden="true">
              <span className="flex size-8 items-center justify-center rounded-full border-2 border-[#fbfaf6] bg-[#d7e5d6] text-xs">🎾</span>
              <span className="flex size-8 items-center justify-center rounded-full border-2 border-[#fbfaf6] bg-[#f5dfc8] text-xs">🏐</span>
              <span className="flex size-8 items-center justify-center rounded-full border-2 border-[#fbfaf6] bg-[#dce8ed] text-xs">🏖️</span>
            </div>
            <span><strong className="font-semibold text-[#30443a]">Uma rede feita para jogar</strong><br />e para quem faz o esporte acontecer.</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div className="absolute -right-8 -top-8 size-40 rounded-full bg-[#e3eddd] blur-2xl sm:size-56" />
          <div className="absolute -bottom-10 -left-8 size-40 rounded-full bg-[#f8e7d4] blur-2xl sm:size-52" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[#e9efe5] p-3 shadow-[0_24px_80px_rgba(31,77,58,0.14)] sm:rounded-[2.5rem] sm:p-5">
            <div className="relative min-h-[340px] overflow-hidden rounded-[1.5rem] bg-[#d4e2d0] sm:min-h-[440px] sm:rounded-[2rem]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_15%,rgba(255,255,255,0.8),transparent_32%),linear-gradient(145deg,#e5eddb_0%,#c8dec6_58%,#b3ceb5_100%)]" />
              <div className="absolute -right-10 top-6 size-48 rounded-full border border-white/50 sm:right-2 sm:size-64" />
              <div className="absolute -right-1 top-14 size-36 rounded-full border border-white/50 sm:right-12 sm:top-20 sm:size-48" />
              <div className="absolute bottom-[-12%] left-[12%] h-[74%] w-[76%] rotate-[-8deg] rounded-[1.5rem] border-[3px] border-white/80 bg-[#47805c] shadow-xl sm:rounded-[2rem]">
                <div className="absolute inset-[9%] border-2 border-white/70" />
                <div className="absolute inset-y-[9%] left-1/2 border-l-2 border-white/70" />
                <div className="absolute inset-x-[9%] top-1/2 border-t-2 border-white/70" />
                <div className="absolute inset-x-[9%] top-[34%] border-t-2 border-white/70" />
                <div className="absolute inset-x-[9%] bottom-[34%] border-t-2 border-white/70" />
                <div className="absolute inset-x-0 top-1/2 border-t-[3px] border-[#f7f1dd]" />
              </div>
              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-3 py-2 text-xs font-semibold text-[#30443a] shadow-sm backdrop-blur sm:left-7 sm:top-7 sm:px-4 sm:text-sm">
                <span className="size-2 rounded-full bg-[#ef9c55]" />
                Bora marcar?
              </div>
              <div className="absolute right-3 top-[34%] flex items-center gap-3 rounded-2xl border border-white/70 bg-white/90 p-3 shadow-lg backdrop-blur sm:right-5 sm:p-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#f8eadb] text-xl">🎾</span>
                <span><strong className="block text-xs font-bold text-[#24382d] sm:text-sm">Jogo encontrado</strong><span className="text-[11px] text-[#758179] sm:text-xs">Hoje · 18h30</span></span>
                <span aria-hidden="true" className="ml-1 text-[#438260]">↗</span>
              </div>
              <div className="absolute bottom-5 left-4 max-w-[220px] rounded-2xl border border-white/70 bg-white/90 p-3 shadow-lg backdrop-blur sm:bottom-7 sm:left-6 sm:max-w-[250px] sm:p-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-full bg-[#e1eadc] text-lg">📍</span>
                  <span><strong className="block text-xs font-bold text-[#24382d] sm:text-sm">Arena perto de você</strong><span className="text-[11px] text-[#758179] sm:text-xs">Quadra disponível · 1,2 km</span></span>
                </div>
              </div>
              <div className="absolute bottom-10 right-5 flex size-12 items-center justify-center rounded-full bg-[#ef9c55] text-xl shadow-lg sm:bottom-14 sm:right-9 sm:size-14">🏐</div>
            </div>
          </div>
          <div className="absolute -bottom-5 right-3 rounded-2xl border border-[#e7ede5] bg-white px-4 py-3 shadow-lg sm:-right-3 sm:px-5">
            <span className="block text-xs font-medium text-[#758179]">Seu esporte, sua galera</span>
            <span className="mt-1 block text-sm font-bold text-[#30443a]">A próxima partida está perto.</span>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="border-y border-[#e7e9df] bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#438260]">Simples assim</span>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#182b24] sm:text-4xl">Como funciona</h2>
            <p className="mt-4 text-base leading-7 text-[#64736b]">Menos tempo combinando. Mais tempo em quadra.</p>
          </div>
          <div className="mt-11 grid gap-4 md:grid-cols-3 md:gap-5 lg:mt-14">
            {steps.map((step) => (
              <article key={step.number} className="rounded-3xl border border-[#e7e9df] bg-[#fbfaf6] p-6 sm:p-7">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-[#e6efe4] text-sm font-bold text-[#38704f]">{step.number}</span>
                <h3 className="mt-6 text-lg font-semibold tracking-tight text-[#24382d]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#64736b]">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="modalidades" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#438260]">Encontre seu jogo</span>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-[#182b24] sm:text-4xl">Um lugar para cada modalidade</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[#64736b]">Do saibro à areia, tem sempre alguém pronto para jogar com você.</p>
        </div>
        <div className="mt-9 grid gap-4 sm:grid-cols-3 sm:gap-5 lg:mt-12">
          {sports.map((sport) => (
            <a key={sport.name} href="#comecar" className="group flex items-center gap-4 rounded-3xl border border-[#e5e8de] bg-white p-5 transition-all hover:-translate-y-1 hover:border-[#b7cfba] hover:shadow-[0_14px_35px_rgba(31,77,58,0.08)] sm:block sm:p-6">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#f5f3e9] text-3xl transition-transform group-hover:scale-105">{sport.emoji}</span>
              <span className="block sm:mt-5"><strong className="block text-lg font-semibold text-[#24382d]">{sport.name}</strong><span className="mt-1 block text-sm text-[#758179]">{sport.detail}</span></span>
              <span aria-hidden="true" className="ml-auto text-lg text-[#438260] transition-transform group-hover:translate-x-1 sm:mt-5 sm:block">↗</span>
            </a>
          ))}
        </div>
      </section>

      <section id="comecar" className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12 lg:pb-24">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#1f4d3a] px-6 py-12 text-center sm:rounded-[2.5rem] sm:px-12 sm:py-16 lg:py-20">
          <div className="absolute -left-20 -top-32 size-72 rounded-full border border-white/10" />
          <div className="absolute -left-10 -top-22 size-52 rounded-full border border-white/10" />
          <div className="absolute -bottom-40 -right-20 size-80 rounded-full bg-[#438260]/30 blur-2xl" />
          <div className="relative mx-auto max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#c4dfc7]">A próxima partida pode ser sua</span>
            <h2 className="mt-4 text-3xl leading-tight font-semibold tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl">Tem espaço na quadra. Falta você.</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#d1dfd3] sm:text-base sm:leading-7">Crie seu perfil e descubra como é fácil encontrar gente para jogar perto de você.</p>
            <a href="#inicio" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#ef9c55] px-6 py-3 text-sm font-bold text-[#292d24] transition-colors hover:bg-[#f2a96b]">Começar agora <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e7e9df] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-center sm:flex-row sm:px-8 sm:text-left lg:px-12">
          <a href="#inicio" className="text-sm font-bold tracking-tight text-[#24382d]">Rede <span className="text-[#438260]">Esportiva</span></a>
          <p className="text-xs text-[#758179]">Conectando pessoas através do esporte.</p>
          <p className="text-xs text-[#929c95]">© {new Date().getFullYear()} Rede Esportiva</p>
        </div>
      </footer>
    </main>
  );
}
