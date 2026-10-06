import type { SearchableSport } from "@/lib/player/search-player-availabilities";

const inputClass = "mt-2 min-h-11 w-full rounded-xl border border-[#dce4dc] bg-white px-3.5 py-2.5 text-sm text-[#24382d] outline-none transition focus:border-[#438260] focus:ring-4 focus:ring-[#438260]/10";

type PlayerSearchFiltersProps = {
  sports: SearchableSport[];
  sportId: string;
};

export function PlayerSearchFilters({ sports, sportId }: PlayerSearchFiltersProps) {
  return (
    <form action="/jogadores" method="get" className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="w-full max-w-sm">
        <label htmlFor="board-sport" className="block text-sm font-medium text-[#42564a]">Filtrar por esporte</label>
        <select id="board-sport" name="sportId" className={inputClass} defaultValue={sportId}>
          <option value="">Todos os esportes</option>
          {sports.map((sport) => <option key={sport.id} value={sport.id}>{sport.name}</option>)}
        </select>
      </div>
      <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#1f4d3a] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#173b2c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#438260]">
        Aplicar filtro
      </button>
    </form>
  );
}
