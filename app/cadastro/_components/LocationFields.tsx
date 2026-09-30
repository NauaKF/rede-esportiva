type LocationFieldsProps = {
  includeAddress?: boolean;
};

const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-[#dce4dc] bg-white px-4 py-3 text-sm text-[#24382d] outline-none transition focus:border-[#438260] focus:ring-4 focus:ring-[#438260]/10";

export function LocationFields({ includeAddress = false }: LocationFieldsProps) {
  return (
    <fieldset className="grid gap-4 sm:grid-cols-2">
      <legend className="mb-1 text-base font-semibold">Localização</legend>
      <label className="text-sm font-medium text-[#42564a]">
        Cidade <span className="text-[#b94b35]">*</span>
        <input className={inputClass} name="city" autoComplete="address-level2" required maxLength={100} placeholder="Ex.: Campinas" />
      </label>
      <label className="text-sm font-medium text-[#42564a]">
        Estado / região <span className="text-[#b94b35]">*</span>
        <input className={inputClass} name="regionCode" autoComplete="address-level1" required maxLength={100} placeholder="Ex.: SP" />
      </label>
      {includeAddress && (
        <>
          <label className="text-sm font-medium text-[#42564a]">
            Rua / avenida <span className="text-[#b94b35]">*</span>
            <input className={inputClass} name="street" autoComplete="street-address" required maxLength={200} placeholder="Nome da rua ou avenida" />
          </label>
          <label className="text-sm font-medium text-[#42564a]">
            Número <span className="text-[#b94b35]">*</span>
            <input className={inputClass} name="streetNumber" required maxLength={30} placeholder="Número" />
          </label>
          <label className="text-sm font-medium text-[#42564a] sm:col-span-2">
            Complemento <span className="font-normal text-[#758179]">(opcional)</span>
            <input className={inputClass} name="addressComplement" autoComplete="address-line2" maxLength={100} placeholder="Bloco, sala ou referência" />
          </label>
        </>
      )}
    </fieldset>
  );
}
