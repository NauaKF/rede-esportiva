"use client";

import { useActionState } from "react";
import { registerPlayer } from "../actions";
import { LocationFields } from "./LocationFields";
import { SportFields } from "./SportFields";
import type { RegistrationActionState, SportOption } from "@/lib/registration/validation";

const initialState: RegistrationActionState = {};
const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-[#dce4dc] bg-white px-4 py-3 text-sm text-[#24382d] outline-none transition focus:border-[#438260] focus:ring-4 focus:ring-[#438260]/10";

export function PlayerRegistrationForm({ sports }: { sports: SportOption[] }) {
  const [state, action, pending] = useActionState(registerPlayer, initialState);

  if (state.success) {
    return <div role="status" className="mt-8 rounded-2xl border border-[#b7cfba] bg-[#edf5eb] p-5 text-sm leading-6 text-[#30443a]">{state.success}</div>;
  }

  return (
    <form action={action} className="mt-8 space-y-7">
      {state.error && <p role="alert" className="rounded-xl border border-[#edc7bc] bg-[#fff3ef] px-4 py-3 text-sm text-[#9e3c2c]">{state.error.message}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-[#42564a]">
          Nome de exibição <span className="text-[#b94b35]">*</span>
          <input className={inputClass} name="name" required maxLength={120} autoComplete="name" placeholder="Como quer ser chamado?" />
          {state.error?.fieldErrors?.name && <span className="mt-1 block text-xs text-[#b94b35]">{state.error.fieldErrors.name}</span>}
        </label>
        <label className="text-sm font-medium text-[#42564a]">
          E-mail <span className="text-[#b94b35]">*</span>
          <input className={inputClass} name="email" type="email" required maxLength={254} autoComplete="email" placeholder="voce@exemplo.com" />
          {state.error?.fieldErrors?.email && <span className="mt-1 block text-xs text-[#b94b35]">{state.error.fieldErrors.email}</span>}
        </label>
        <label className="text-sm font-medium text-[#42564a]">
          Senha <span className="text-[#b94b35]">*</span>
          <input className={inputClass} name="password" type="password" required minLength={12} maxLength={128} autoComplete="new-password" />
          {state.error?.fieldErrors?.password && <span className="mt-1 block text-xs text-[#b94b35]">{state.error.fieldErrors.password}</span>}
        </label>
        <label className="text-sm font-medium text-[#42564a]">
          Confirme a senha <span className="text-[#b94b35]">*</span>
          <input className={inputClass} name="passwordConfirmation" type="password" required minLength={12} maxLength={128} autoComplete="new-password" />
          {state.error?.fieldErrors?.passwordConfirmation && <span className="mt-1 block text-xs text-[#b94b35]">{state.error.fieldErrors.passwordConfirmation}</span>}
        </label>
      </div>
      <LocationFields />
      <SportFields sports={sports} showLevels fieldErrors={state.error?.fieldErrors} />
      {state.error?.fieldErrors?.sports && <p className="-mt-5 text-xs text-[#b94b35]">{state.error.fieldErrors.sports}</p>}
      <label className="block text-sm font-medium text-[#42564a]">
        Sobre você <span className="font-normal text-[#758179]">(opcional)</span>
        <textarea className={`${inputClass} min-h-28 resize-y`} name="bio" maxLength={500} placeholder="Conte um pouco sobre seu jeito de jogar." />
        {state.error?.fieldErrors?.bio && <span className="mt-1 block text-xs text-[#b94b35]">{state.error.fieldErrors.bio}</span>}
      </label>
      <button disabled={pending || sports.length === 0} className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#1f4d3a] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#173b2c] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
        {pending ? "Enviando cadastro…" : "Criar perfil de jogador"}
      </button>
      <p className="text-xs leading-5 text-[#758179]">Sua conta ficará pendente enquanto preparamos o acesso.</p>
    </form>
  );
}
