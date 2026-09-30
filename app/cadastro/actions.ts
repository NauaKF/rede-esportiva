"use server";

import { createArenaAccount, createPlayerAccount } from "@/lib/registration/create-account";
import {
  parseArenaRegistration,
  parsePlayerRegistration,
  type RegistrationActionState,
} from "@/lib/registration/validation";
import { hashPassword } from "@/lib/auth/password";

const duplicateEmailMessage = "Este e-mail já está cadastrado. Use outro e-mail ou entre em contato com a gente.";

function isDuplicateEmailError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

export async function registerPlayer(
  _previousState: RegistrationActionState,
  formData: FormData,
): Promise<RegistrationActionState> {
  const parsed = parsePlayerRegistration(formData);
  if (!parsed.success) return { error: parsed.error };

  try {
    const passwordHash = await hashPassword(parsed.data.password);
    const result = await createPlayerAccount({
      name: parsed.data.name,
      email: parsed.data.email,
      bio: parsed.data.bio,
      location: parsed.data.location,
      sports: parsed.data.sports,
      passwordHash,
    });
    if (result.kind === "invalid-sports") {
      return { error: { message: "Uma das modalidades ou níveis não está mais disponível. Atualize a página e tente novamente." } };
    }
    return { success: "Cadastro recebido! Sua conta está pendente e avisaremos quando o acesso estiver disponível." };
  } catch (error) {
    if (isDuplicateEmailError(error)) return { error: { message: duplicateEmailMessage } };
    return { error: { message: "Não foi possível concluir o cadastro agora. Tente novamente em instantes." } };
  }
}

export async function registerArena(
  _previousState: RegistrationActionState,
  formData: FormData,
): Promise<RegistrationActionState> {
  const parsed = parseArenaRegistration(formData);
  if (!parsed.success) return { error: parsed.error };

  try {
    const passwordHash = await hashPassword(parsed.data.password);
    const result = await createArenaAccount({
      name: parsed.data.name,
      email: parsed.data.email,
      location: parsed.data.location,
      sports: parsed.data.sports,
      passwordHash,
    });
    if (result.kind === "invalid-sports") {
      return { error: { message: "Uma das modalidades não está mais disponível. Atualize a página e tente novamente." } };
    }
    return { success: "Cadastro recebido! Sua conta está pendente e avisaremos quando o acesso estiver disponível." };
  } catch (error) {
    if (isDuplicateEmailError(error)) return { error: { message: duplicateEmailMessage } };
    return { error: { message: "Não foi possível concluir o cadastro agora. Tente novamente em instantes." } };
  }
}
