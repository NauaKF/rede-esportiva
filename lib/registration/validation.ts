export type RegistrationError = {
  message: string;
  fieldErrors?: Record<string, string>;
};

export type RegistrationActionState = {
  error?: RegistrationError;
  success?: string;
};

export type LocationInput = {
  city: string;
  regionCode: string;
  street?: string;
  streetNumber?: string;
  addressComplement?: string;
};

export type PlayerSportInput = { sportId: number; levelId: number };
export type SportOption = { id: number; name: string; levels: { id: number; label: string }[] };

export type PlayerRegistrationInput = {
  name: string;
  email: string;
  bio: string | null;
  location: LocationInput;
  sports: PlayerSportInput[];
};

export type ArenaRegistrationInput = {
  name: string;
  email: string;
  location: LocationInput & { street: string; streetNumber: string; neighborhood: string };
  sports: number[];
};

export type ParsedRegistration<T> =
  | { success: true; data: T }
  | { success: false; error: RegistrationError };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") return "";
  return value.trim();
}

function readBase(formData: FormData, entityName: string) {
  const name = readText(formData, "name");
  const email = readText(formData, "email").toLowerCase();
  const city = readText(formData, "city");
  const regionCode = readText(formData, "regionCode");
  const fieldErrors: Record<string, string> = {};

  if (!name) fieldErrors.name = `Informe ${entityName === "arena" ? "o nome da arena" : "seu nome"}.`;
  else if (name.length > 120) fieldErrors.name = "Use no máximo 120 caracteres.";
  if (!email) fieldErrors.email = "Informe seu e-mail.";
  else if (email.length > 254) fieldErrors.email = "Use no máximo 254 caracteres no e-mail.";
  else if (!emailPattern.test(email)) fieldErrors.email = "Informe um e-mail válido.";
  if (!city) fieldErrors.city = "Informe a cidade.";
  else if (city.length > 100) fieldErrors.city = "Use no máximo 100 caracteres.";
  if (!regionCode) fieldErrors.regionCode = "Informe o estado ou região.";
  else if (regionCode.length > 100) fieldErrors.regionCode = "Use no máximo 100 caracteres.";

  return { name, email, city, regionCode, fieldErrors };
}

function readSportIds(formData: FormData): number[] | null {
  const rawValues = formData.getAll("sportIds");
  const ids: number[] = [];
  for (const value of rawValues) {
    if (typeof value !== "string" || !/^\d+$/.test(value)) return null;
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id < 1) return null;
    ids.push(id);
  }
  return [...new Set(ids)];
}

export function parsePlayerRegistration(formData: FormData): ParsedRegistration<PlayerRegistrationInput> {
  const base = readBase(formData, "player");
  const bio = readText(formData, "bio");
  const ids = readSportIds(formData);
  const sports: PlayerSportInput[] = [];

  if (!ids) base.fieldErrors.sports = "A seleção de modalidades é inválida.";
  else if (ids.length === 0) base.fieldErrors.sports = "Escolha pelo menos uma modalidade.";
  else {
    for (const sportId of ids) {
      const rawLevel = formData.get(`level_${sportId}`);
      if (typeof rawLevel !== "string" || !/^\d+$/.test(rawLevel) || !Number.isSafeInteger(Number(rawLevel)) || Number(rawLevel) < 1) {
        base.fieldErrors[`level_${sportId}`] = "Informe seu nível nesta modalidade.";
      } else {
        sports.push({ sportId, levelId: Number(rawLevel) });
      }
    }
  }
  if (bio.length > 500) base.fieldErrors.bio = "Use no máximo 500 caracteres.";

  if (Object.keys(base.fieldErrors).length) {
    return { success: false, error: { message: "Revise os campos destacados.", fieldErrors: base.fieldErrors } };
  }

  return {
    success: true,
    data: {
      name: base.name,
      email: base.email,
      bio: bio || null,
      location: { city: base.city, regionCode: base.regionCode },
      sports,
    },
  };
}

export function parseArenaRegistration(formData: FormData): ParsedRegistration<ArenaRegistrationInput> {
  const base = readBase(formData, "arena");
  const street = readText(formData, "street");
  const streetNumber = readText(formData, "streetNumber");
  const neighborhood = readText(formData, "neighborhood");
  const addressComplementValue = readText(formData, "addressComplement");
  const addressComplement = addressComplementValue || undefined;
  const fieldErrors = base.fieldErrors;
  const ids = readSportIds(formData);

  if (!neighborhood) fieldErrors.neighborhood = "Informe o bairro.";
  else if (neighborhood.length > 100) fieldErrors.neighborhood = "Use no m\u00e1ximo 100 caracteres.";

  if (!street) fieldErrors.street = "Informe a rua ou avenida.";
  else if (street.length > 200) fieldErrors.street = "Use no máximo 200 caracteres.";
  if (!streetNumber) fieldErrors.streetNumber = "Informe o número.";
  else if (streetNumber.length > 30) fieldErrors.streetNumber = "Use no máximo 30 caracteres.";
  if (addressComplementValue.length > 100) fieldErrors.addressComplement = "Use no máximo 100 caracteres.";
  if (!ids) fieldErrors.sports = "A seleção de modalidades é inválida.";
  else if (ids.length === 0) fieldErrors.sports = "Escolha pelo menos uma modalidade.";

  if (Object.keys(fieldErrors).length) {
    return { success: false, error: { message: "Revise os campos destacados.", fieldErrors } };
  }

  return {
    success: true,
    data: {
      name: base.name,
      email: base.email,
      location: { city: base.city, regionCode: base.regionCode, street, streetNumber, neighborhood, addressComplement },
      sports: ids!,
    },
  };
}
