export type PlayerProfileUpdateInput = {
  name: string;
  bio: string | null;
};

export type PlayerProfileUpdateErrors = {
  name?: string;
  bio?: string;
};

export type PlayerProfileUpdateValidationResult =
  | { success: true; data: PlayerProfileUpdateInput }
  | { success: false; errors: PlayerProfileUpdateErrors };

export function validatePlayerProfileUpdate(
  name: string,
  bio: string,
): PlayerProfileUpdateValidationResult {
  const normalizedName = name.trim();
  const normalizedBio = bio.trim();
  const errors: PlayerProfileUpdateErrors = {};

  if (!normalizedName) {
    errors.name = "Informe seu nome.";
  } else if (normalizedName.length > 120) {
    errors.name = "Use no máximo 120 caracteres no nome.";
  }

  if (normalizedBio.length > 500) {
    errors.bio = "Use no máximo 500 caracteres na bio.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name: normalizedName,
      bio: normalizedBio || null,
    },
  };
}
