"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccount } from "@/lib/auth/require-account";
import {
  cancelPlayerAvailability,
  createPlayerAvailability,
} from "@/lib/player/availability";
import {
  validatePlayerAvailability,
  type PlayerAvailabilityFieldErrors,
  type PlayerAvailabilityFormInput,
} from "@/lib/player/availability-validation";

export type PlayerAvailabilityActionState = {
  success?: string;
  error?: string;
  fieldErrors?: PlayerAvailabilityFieldErrors;
};

function readRequiredText(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

export async function publishPlayerAvailability(
  _previousState: PlayerAvailabilityActionState,
  formData: FormData,
): Promise<PlayerAvailabilityActionState> {
  const account = await requireAccount();

  if (account.accountType !== "PLAYER") redirect("/inicio");
  if (account.status !== "ACTIVE") {
    return { error: "Sua conta precisa estar ativa para publicar disponibilidades." };
  }

  const keys: (keyof PlayerAvailabilityFormInput)[] = [
    "sportId",
    "date",
    "startTime",
    "endTime",
    "timeZone",
  ];
  const input = {} as PlayerAvailabilityFormInput;
  const missing: PlayerAvailabilityFieldErrors = {};

  for (const key of keys) {
    const value = readRequiredText(formData, key);
    if (value === null) {
      missing[key] = "Este campo Ã© obrigatÃ³rio.";
    } else {
      input[key] = value;
    }
  }

  if (Object.keys(missing).length > 0) return { fieldErrors: missing };

  const validation = validatePlayerAvailability(input);
  if (!validation.success) return { fieldErrors: validation.errors };

  let result;
  try {
    result = await createPlayerAvailability({
      accountId: account.accountId,
      ...validation.data,
    });
  } catch {
    return { error: "NÃ£o foi possÃ­vel publicar a disponibilidade agora. Tente novamente." };
  }

  if (result.kind === "sport-not-practiced") {
    return { error: "VocÃª nÃ£o pratica essa modalidade ou ela nÃ£o estÃ¡ disponÃ­vel." };
  }

  revalidatePath("/perfil");
  return { success: "Sua disponibilidade foi publicada." };
}

export async function cancelPlayerAvailabilityAction(
  _previousState: PlayerAvailabilityActionState,
  formData: FormData,
): Promise<PlayerAvailabilityActionState> {
  const account = await requireAccount();

  if (account.accountType !== "PLAYER") redirect("/inicio");

  const rawId = readRequiredText(formData, "availabilityId");
  if (!rawId || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(rawId)) {
    return { error: "Selecione uma disponibilidade vÃ¡lida para cancelar." };
  }

  let result;
  try {
    result = await cancelPlayerAvailability(account.accountId, rawId);
  } catch {
    return { error: "NÃ£o foi possÃ­vel cancelar a disponibilidade agora. Tente novamente." };
  }

  if (result.kind === "not-found") {
    return { error: "Essa disponibilidade nÃ£o foi encontrada ou jÃ¡ foi cancelada." };
  }

  revalidatePath("/perfil");
  redirect("/perfil?availability=cancelled");
}
