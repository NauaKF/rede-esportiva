"use client";

import { useActionState } from "react";
import { savePlayerProfile, type PlayerProfileActionState } from "../actions";

const initialState: PlayerProfileActionState = {};
const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-[#dce4dc] bg-white px-4 py-3 text-sm text-[#24382d] outline-none transition placeholder:text-[#929c95] focus:border-[#438260] focus:ring-4 focus:ring-[#438260]/10 disabled:cursor-not-allowed disabled:opacity-60";

type EditPlayerProfileFormProps = {
  name: string;
  bio: string | null;
};

export function EditPlayerProfileForm({ name, bio }: EditPlayerProfileFormProps) {
  const [state, action, pending] = useActionState(savePlayerProfile, initialState);

  return (
    <form action={action} className="mt-8 space-y-5" aria-busy={pending}>
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

      <div>
        <label htmlFor="profile-name" className="block text-sm font-medium text-[#42564a]">
          Nome
        </label>
        <input
          id="profile-name"
          name="name"
          type="text"
          required
          maxLength={120}
          autoComplete="name"
          defaultValue={name}
          disabled={pending}
          aria-invalid={Boolean(state.fieldErrors?.name)}
          aria-describedby={state.fieldErrors?.name ? "profile-name-error" : undefined}
          className={inputClass}
        />
        {state.fieldErrors?.name && (
          <p id="profile-name-error" className="mt-1 text-xs text-[#b94b35]">
            {state.fieldErrors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="profile-bio" className="block text-sm font-medium text-[#42564a]">
          Bio <span className="font-normal text-[#758179]">(opcional)</span>
        </label>
        <textarea
          id="profile-bio"
          name="bio"
          maxLength={500}
          rows={5}
          defaultValue={bio ?? ""}
          disabled={pending}
          aria-invalid={Boolean(state.fieldErrors?.bio)}
          aria-describedby={state.fieldErrors?.bio ? "profile-bio-error" : undefined}
          placeholder="Conte um pouco sobre você e seu jeito de jogar."
          className={`${inputClass} min-h-32 resize-y`}
        />
        {state.fieldErrors?.bio && (
          <p id="profile-bio-error" className="mt-1 text-xs text-[#b94b35]">
            {state.fieldErrors.bio}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#1f4d3a] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#173b2c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#438260] disabled:cursor-wait disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Salvando…" : "Salvar alterações"}
      </button>
    </form>
  );
}
