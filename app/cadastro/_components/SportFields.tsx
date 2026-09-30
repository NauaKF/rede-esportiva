import type { SportOption } from "@/lib/registration/validation";

export function SportFields({ sports, showLevels = false, fieldErrors = {} }: { sports: SportOption[]; showLevels?: boolean; fieldErrors?: Record<string, string> }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-base font-semibold">Modalidades <span className="text-[#b94b35]">*</span></legend>
      <p className="-mt-1 text-sm text-[#758179]">Selecione pelo menos uma modalidade{showLevels ? " e indique seu nível em cada uma" : " disponível na arena"}.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {sports.map((sport) => (
          <label key={sport.id} className="flex items-start gap-3 rounded-2xl border border-[#e5e8de] bg-[#fbfaf6] p-4 text-sm">
            <input className="mt-1 size-4 accent-[#438260]" type="checkbox" name="sportIds" value={sport.id} />
            <span className="min-w-0 flex-1">
              <span className="font-semibold text-[#30443a]">{sport.name}</span>
              {showLevels && (
                <span className="mt-3 block">
                  <span className="mb-1 block text-xs font-medium text-[#64736b]">Nível</span>
                  <select className="min-h-10 w-full rounded-lg border border-[#dce4dc] bg-white px-3 text-sm outline-none focus:border-[#438260]" name={`level_${sport.id}`} defaultValue="">
                    <option value="">Selecione ao marcar</option>
                    {sport.levels.map((level) => <option key={level.id} value={level.id}>{level.label}</option>)}
                  </select>
                  {fieldErrors[`level_${sport.id}`] && <span className="mt-1 block text-xs text-[#b94b35]">{fieldErrors[`level_${sport.id}`]}</span>}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>
      {sports.length === 0 && <p className="text-sm text-[#b94b35]">Não foi possível carregar as modalidades. Tente novamente mais tarde.</p>}
    </fieldset>
  );
}
