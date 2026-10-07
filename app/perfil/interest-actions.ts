"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccount } from "@/lib/auth/require-account";
import {
  updatePlayerInterestRequest,
  type PlayerInterestDecision,
} from "@/lib/player/interest";

export type PlayerInterestDecisionActionState = {
  success?: string;
  error?: string;
  fieldErrors?: {
    requestId?: string;
    action?: string;
  };
};

const UUID_PATTERN = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

function readRequiredText(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function isPlayerInterestDecision(value: string | null): value is PlayerInterestDecision {
  return value === "ACCEPT" || value === "REJECT";
}

export async function decidePlayerInterestRequest(
  _previousState: PlayerInterestDecisionActionState,
  formData: FormData,
): Promise<PlayerInterestDecisionActionState> {
  const account = await requireAccount();

  if (account.accountType !== "PLAYER") redirect("/inicio");

  const requestId = readRequiredText(formData, "requestId");
  if (!requestId || !UUID_PATTERN.test(requestId)) {
    return { fieldErrors: { requestId: "Selecione uma solicitação válida." } };
  }

  const action = readRequiredText(formData, "action");
  if (!isPlayerInterestDecision(action)) {
    return { fieldErrors: { action: "Escolha aceitar ou rejeitar a solicitação." } };
  }

  try {
    const result = await updatePlayerInterestRequest(requestId, action);

    switch (result.kind) {
      case "updated":
        revalidatePath("/perfil");
        return {
          success: result.status === "ACCEPTED"
            ? "Solicitação aceita."
            : "Solicitação rejeitada.",
        };
      case "not-updatable":
        return { error: "Essa solicitação não está mais pendente ou não está disponível para essa ação." };
      case "not-authorized":
        return { error: "Não foi possível atualizar essa solicitação." };
      case "invalid-request-id":
        return { fieldErrors: { requestId: "Selecione uma solicitação válida." } };
      case "invalid-action":
        return { fieldErrors: { action: "Escolha aceitar ou rejeitar a solicitação." } };
      case "error":
        return { error: "Não foi possível atualizar a solicitação agora. Tente novamente." };
    }
  } catch {
    return { error: "Não foi possível atualizar a solicitação agora. Tente novamente." };
  }
}
