"use client";

import { useActionState } from "react";
import { cancelPlayerAvailabilityAction } from "../availability-actions";
import type { PlayerAvailabilityActionState } from "../availability-actions";

const initialState: PlayerAvailabilityActionState = {};

type CancelAvailabilityButtonProps = {
  availabilityId: string;
};

export function CancelAvailabilityButton({ availabilityId }: CancelAvailabilityButtonProps) {
  const [state, action, pending] = useActionState(cancelPlayerAvailabilityAction, initialState);

  return (
    <form action={action} className="mt-5">
      <input type="hidden" name="availabilityId" value={availabilityId} />
      {state.error && <p role="alert" className="mb-3 text-sm text-[#9e3c2c]">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d7b7af] px-4 py-2 text-sm font-semibold text-[#8e3b2e] transition-colors hover:bg-[#fff3ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b94b35] disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Cancelando…" : "Cancelar disponibilidade"}
      </button>
    </form>
  );
}
