"use client";

import { useActionState } from "react";
import {
  sendPlayerInterest,
  type PlayerInterestActionState,
} from "../interest-actions";

const initialState: PlayerInterestActionState = {};

type PlayerInterestButtonProps = {
  availabilityId: string;
  hasInterest: boolean;
};

export function PlayerInterestButton({ availabilityId, hasInterest }: PlayerInterestButtonProps) {
  const [state, formAction, isPending] = useActionState(sendPlayerInterest, initialState);
  const sent = hasInterest || Boolean(state.success);
  const errorMessage = state.error ?? state.fieldErrors?.availabilityId;

  return (
    <div className="mt-5">
      <form action={formAction}>
        <input type="hidden" name="availabilityId" value={availabilityId} />
        <button
          type="submit"
          disabled={isPending || sent}
          className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#1f4d3a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#173b2c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#438260] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Enviando…" : sent ? "Interesse enviado!" : "Tenho interesse"}
        </button>
      </form>
      {state.success && (
        <p role="status" className="mt-2 text-sm font-medium text-[#38704f]">
          {state.success}
        </p>
      )}
      {errorMessage && (
        <p role="alert" className="mt-2 text-sm text-[#9e3c2c]">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
