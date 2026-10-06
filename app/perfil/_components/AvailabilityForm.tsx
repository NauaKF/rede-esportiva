"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import {
  publishPlayerAvailability,
  type PlayerAvailabilityActionState,
} from "../availability-actions";
import type { PlayerAvailabilitySport } from "@/lib/player/availability";

const initialState: PlayerAvailabilityActionState = {};
const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-[#dce4dc] bg-white px-4 py-3 text-sm text-[#24382d] outline-none transition placeholder:text-[#929c95] focus:border-[#438260] focus:ring-4 focus:ring-[#438260]/10 disabled:cursor-not-allowed disabled:opacity-60";

type AvailabilityFormProps = {
  sports: PlayerAvailabilitySport[];
};

const fieldLabels: Record<string, string> = {
  sportId: "Modalidade",
  date: "Data",
  startTime: "Horário de início",
  endTime: "Horário de término",
  timeZone: "Fuso horário",
};

export function AvailabilityForm({ sports }: AvailabilityFormProps) {
  const [state, action, pending] = useActionState(publishPlayerAvailability, initialState);
  const [timeZone, setTimeZone] = useState("");

  useEffect(() => {
    try {
      setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    } catch {
      setTimeZone("UTC");
    }
  }, []);

  return (
    <form action={action} className="mt-6 space-y-5" aria-busy={pending}>
      {state.success && (
        <p role="status" className="rounded-xl border border-[#b7cfba] bg-[#edf5eb] px-4 py-3 text-sm leading-5 text-[#30443a]">
          {state.success}
        </p>
      )}
      {state.error && (
        <p role="alert" className="rounded-xl border border-[#edc7bc] bg-[#fff3ef] px-4 py-3 text-sm leading-5 text-[#9e3c2c]">
          {state.error}
        </p>
      )}
      {state.fieldErrors && Object.keys(state.fieldErrors).length > 0 && (
        <div role="alert" className="rounded-xl border border-[#edc7bc] bg-[#fff3ef] px-4 py-3 text-sm leading-5 text-[#9e3c2c]">
          <p className="font-semibold">Confira os campos destacados:</p>
          <ul className="mt-1 list-inside list-disc">
            {Object.entries(state.fieldErrors).map(([field, message]) => (
              <li key={field}>
                {fieldLabels[field] ?? "Campo"}: {message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="availability-sport" className="block text-sm font-medium text-[#42564a]">Modalidade</label>
          <select id="availability-sport" name="sportId" required disabled={pending || sports.length === 0} aria-invalid={Boolean(state.fieldErrors?.sportId)} aria-describedby={state.fieldErrors?.sportId ? "availability-sport-error" : undefined} className={inputClass} defaultValue="">
            <option value="" disabled>Selecione uma modalidade</option>
            {sports.map((sport) => <option key={sport.id} value={sport.id}>{sport.name}</option>)}
          </select>
          {state.fieldErrors?.sportId && <p id="availability-sport-error" className="mt-1 text-xs text-[#b94b35]">{state.fieldErrors.sportId}</p>}
          {sports.length === 0 && <p className="mt-1 text-xs text-[#758179]">Nenhuma modalidade praticada está disponível.</p>}
        </div>

        <div>
          <label htmlFor="availability-date" className="block text-sm font-medium text-[#42564a]">Data</label>
          <input id="availability-date" name="date" type="date" required disabled={pending} aria-invalid={Boolean(state.fieldErrors?.date)} aria-describedby={state.fieldErrors?.date ? "availability-date-error" : undefined} className={inputClass} />
          {state.fieldErrors?.date && <p id="availability-date-error" className="mt-1 text-xs text-[#b94b35]">{state.fieldErrors.date}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="availability-start" className="block text-sm font-medium text-[#42564a]">Início</label>
            <input id="availability-start" name="startTime" type="time" required disabled={pending} aria-invalid={Boolean(state.fieldErrors?.startTime)} aria-describedby={state.fieldErrors?.startTime ? "availability-start-error" : undefined} className={inputClass} />
            {state.fieldErrors?.startTime && <p id="availability-start-error" className="mt-1 text-xs text-[#b94b35]">{state.fieldErrors.startTime}</p>}
          </div>
          <div>
            <label htmlFor="availability-end" className="block text-sm font-medium text-[#42564a]">Término</label>
            <input id="availability-end" name="endTime" type="time" required disabled={pending} aria-invalid={Boolean(state.fieldErrors?.endTime)} aria-describedby={state.fieldErrors?.endTime ? "availability-end-error" : undefined} className={inputClass} />
            {state.fieldErrors?.endTime && <p id="availability-end-error" className="mt-1 text-xs text-[#b94b35]">{state.fieldErrors.endTime}</p>}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="availability-time-zone" className="block text-sm font-medium text-[#42564a]">Fuso horário</label>
          <input id="availability-time-zone" name="timeZone" type="text" required maxLength={100} autoComplete="off" placeholder="Ex.: America/Sao_Paulo" value={timeZone} onChange={(event) => setTimeZone(event.target.value)} disabled={pending} aria-invalid={Boolean(state.fieldErrors?.timeZone)} aria-describedby={state.fieldErrors?.timeZone ? "availability-time-zone-help availability-time-zone-error" : "availability-time-zone-help"} className={inputClass} />
          <p id="availability-time-zone-help" className="mt-1 text-xs text-[#758179]">Preenchido pelo fuso do seu navegador. Você pode alterar antes de publicar.</p>
          {state.fieldErrors?.timeZone && <p id="availability-time-zone-error" className="mt-1 text-xs text-[#b94b35]">{state.fieldErrors.timeZone}</p>}
        </div>
      </div>

      <button type="submit" disabled={pending || sports.length === 0} className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#1f4d3a] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#173b2c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#438260] disabled:cursor-wait disabled:opacity-60 sm:w-auto">
        {pending ? "Publicando…" : "Publicar disponibilidade"}
      </button>
    </form>
  );
}
