"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAccount } from "@/lib/auth/require-account";
import { updatePlayerProfile } from "@/lib/player/update-player-profile";
import {
  validatePlayerProfileUpdate,
  type PlayerProfileUpdateErrors,
} from "@/lib/player/validation";

export type PlayerProfileActionState = {
  success?: string;
  error?: string;
  fieldErrors?: PlayerProfileUpdateErrors;
};

export async function savePlayerProfile(
  _previousState: PlayerProfileActionState,
  formData: FormData,
): Promise<PlayerProfileActionState> {
  const account = await requireAccount();

  if (account.accountType !== "PLAYER") redirect("/inicio");

  const rawName = formData.get("name");
  const rawBio = formData.get("bio");
  const name = typeof rawName === "string" ? rawName : "";

  if (rawBio !== null && typeof rawBio !== "string") {
    return {
      fieldErrors: { bio: "Informe uma bio válida." },
    };
  }

  const validation = validatePlayerProfileUpdate(
    name,
    typeof rawBio === "string" ? rawBio : "",
  );

  if (!validation.success) {
    return { fieldErrors: validation.errors };
  }

  let result;
  try {
    result = await updatePlayerProfile(
      account.accountId,
      validation.data.name,
      validation.data.bio,
    );
  } catch {
    return { error: "Não foi possível salvar seu perfil agora. Tente novamente." };
  }

  if (result.kind === "not-found") {
    return { error: "Não encontramos seu perfil de jogador para atualizar." };
  }

  revalidatePath("/perfil");
  return { success: "Seu perfil foi atualizado." };
}
