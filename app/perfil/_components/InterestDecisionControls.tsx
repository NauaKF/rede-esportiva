"use client";

import { useActionState } from "react";
import {
  decidePlayerInterestRequest,
  type PlayerInterestDecisionActionState,
} from "../interest-actions";

const initialState: PlayerInterestDecisionActionState = {};

type InterestDecisionControlsProps = {
  requestId: string;
};

export function InterestDecisionControls({ requestId }: InterestDecisionControlsProps) {
  const [state, formAction, isPending] = useActionState(
    decidePlayerInterestRequest,
    initialState,
  );
  const completed = Boolean(state.success);
  const hasError = Boolean(state.error || state.fieldErrors);

  return (
    <div className="mt-4">
      <form action={formAction} aria-busy={isPending}>
        <input type="hidden" name="requestId" value={requestId} />
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            name="action"
            value="ACCEPT"
            disabled={isPending || completed}
            className="inline-flex min-h-9 items-center justify-center rounded-full bg-[#1f4d3a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#173b2c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#438260] disabled:cursor-wait disabled:opacity-60"
          >
            Aceitar
          </button>
          <button
            type="submit"
            name="action"
            value="REJECT"
            disabled={isPending || completed}
            className="inline-flex min-h-9 items-center justify-center rounded-full border border-[#d7b7af] px-4 py-2 text-sm font-semibold text-[#8e3b2e] transition-colors hover:bg-[#fff3ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b94b35] disabled:cursor-wait disabled:opacity-60"
          >
            Rejeitar
          </button>
        </div>
        {isPending && (
          <p role="status" className="mt-2 text-sm text-[#64736b]">
            Processando decisão…
          </p>
        )}
        {state.success && (
          <p role="status" className="mt-2 text-sm font-medium text-[#38704f]">
            {state.success}
          </p>
        )}
        {hasError && (
          <p role="alert" className="mt-2 text-sm text-[#9e3c2c]">
            Não foi possível processar a solicitação. Atualize a página e tente novamente.
          </p>
        )}
      </form>
    </div>
  );
}
