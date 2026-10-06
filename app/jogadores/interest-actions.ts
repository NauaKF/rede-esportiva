"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccount } from "@/lib/auth/require-account";
import { createPlayerInterestRequest } from "@/lib/player/interest";

export type PlayerInterestActionState = {
  success?: string;
  error?: string;
  fieldErrors?: { availabilityId?: string };
};

const UUID_PATTERN = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

export async function sendPlayerInterest(
  _previousState: PlayerInterestActionState,
  formData: FormData,
): Promise<PlayerInterestActionState> {
  const account = await requireAccount();

  if (account.accountType !== "PLAYER") redirect("/inicio");
  if (account.status !== "ACTIVE") {
    return { error: "Sua conta precisa estar ativa para demonstrar interesse." };
  }

  const rawAvailabilityId = formData.get("availabilityId");
  const availabilityId = typeof rawAvailabilityId === "string"
    ? rawAvailabilityId.trim()
    : "";

  if (!UUID_PATTERN.test(availabilityId)) {
    return {
      fieldErrors: { availabilityId: "Selecione uma disponibilidade válida." },
    };
  }

  try {
    const result = await createPlayerInterestRequest({
      availabilityId,
      accountId: account.accountId,
    });

    switch (result.kind) {
      case "created":
        revalidatePath("/jogadores");
        return { success: "Seu interesse foi enviado." };
      case "account-unavailable":
        return { error: "Sua conta precisa estar ativa para demonstrar interesse." };
      case "availability-unavailable":
        return { error: "Essa disponibilidade não está mais disponível para receber interesse." };
      case "own-availability":
        return { error: "Você não pode demonstrar interesse na sua própria disponibilidade." };
      case "duplicate":
        revalidatePath("/jogadores");
        return { success: "Interesse enviado!" };
      case "error":
        return { error: "Não foi possível enviar seu interesse agora. Tente novamente." };
    }
  } catch {
    return { error: "Não foi possível enviar seu interesse agora. Tente novamente." };
  }
}
