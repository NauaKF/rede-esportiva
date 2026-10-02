export type PlayerAvailabilityFormInput = {
  sportId: string;
  date: string;
  startTime: string;
  endTime: string;
  timeZone: string;
};

export type PlayerAvailabilityFieldErrors = Partial<
  Record<keyof PlayerAvailabilityFormInput, string>
>;

export type PlayerAvailabilityData = {
  sportId: number;
  startsAt: string;
  endsAt: string;
  timeZone: string;
};

export type PlayerAvailabilityValidationResult =
  | { success: true; data: PlayerAvailabilityData }
  | { success: false; errors: PlayerAvailabilityFieldErrors };

type LocalDateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function dateTimePartsAsUtc(parts: LocalDateTimeParts): number {
  const date = new Date(0);
  date.setUTCFullYear(parts.year, parts.month - 1, parts.day);
  date.setUTCHours(parts.hour, parts.minute, 0, 0);
  return date.getTime();
}

function parseDate(value: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function parseTime(value: string): { hour: number; minute: number } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;

  return { hour, minute };
}

function createTimeZoneFormatter(timeZone: string): Intl.DateTimeFormat | null {
  const fixedOffsetPattern = /^[+-]\d{2}(?::?\d{2})?$/;
  if (
    !timeZone ||
    timeZone.length > 100 ||
    timeZone !== timeZone.trim() ||
    fixedOffsetPattern.test(timeZone)
  ) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
  } catch {
    return null;
  }
}

function getZonedParts(formatter: Intl.DateTimeFormat, instant: number): LocalDateTimeParts {
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date(instant)).map(({ type, value }) => [type, value]),
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function sameLocalDateTime(left: LocalDateTimeParts, right: LocalDateTimeParts): boolean {
  return left.year === right.year &&
    left.month === right.month &&
    left.day === right.day &&
    left.hour === right.hour &&
    left.minute === right.minute;
}

type LocalTimeResolution =
  | { kind: "resolved"; instant: number }
  | { kind: "nonexistent" }
  | { kind: "ambiguous" };

function resolveLocalDateTime(
  parts: LocalDateTimeParts,
  formatter: Intl.DateTimeFormat,
): LocalTimeResolution {
  const localAsUtc = dateTimePartsAsUtc(parts);
  const offsets = new Set<number>();

  // Collect offsets around the requested wall time to cover either side of a
  // daylight-saving transition without relying on the server's local zone.
  const threeHours = 3 * 60 * 60 * 1000;
  const thirtySixHours = 36 * 60 * 60 * 1000;
  for (let sample = localAsUtc - thirtySixHours; sample <= localAsUtc + thirtySixHours; sample += threeHours) {
    const zoned = getZonedParts(formatter, sample);
    offsets.add(dateTimePartsAsUtc(zoned) - sample);
  }

  const candidates = new Set<number>();
  for (const offset of offsets) {
    const candidate = localAsUtc - offset;
    if (sameLocalDateTime(getZonedParts(formatter, candidate), parts)) {
      candidates.add(candidate);
    }
  }

  if (candidates.size === 0) return { kind: "nonexistent" };
  if (candidates.size > 1) return { kind: "ambiguous" };
  return { kind: "resolved", instant: candidates.values().next().value as number };
}

export function validatePlayerAvailability(
  input: PlayerAvailabilityFormInput,
  now: Date = new Date(),
): PlayerAvailabilityValidationResult {
  const errors: PlayerAvailabilityFieldErrors = {};
  const sportId = /^\d+$/.test(input.sportId) ? Number(input.sportId) : NaN;
  const date = parseDate(input.date);
  const startTime = parseTime(input.startTime);
  const endTime = parseTime(input.endTime);
  const timeZone = input.timeZone;
  const formatter = createTimeZoneFormatter(timeZone);

  if (!Number.isSafeInteger(sportId) || sportId < 1 || sportId > 32767) {
    errors.sportId = "Selecione uma modalidade válida.";
  }
  if (!date) errors.date = "Informe uma data válida.";
  if (!startTime) errors.startTime = "Informe um horário de início válido.";
  if (!endTime) errors.endTime = "Informe um horário de término válido.";
  if (!formatter) errors.timeZone = "Informe um fuso horário IANA válido.";

  if (startTime && endTime && startTime.hour * 60 + startTime.minute >= endTime.hour * 60 + endTime.minute) {
    errors.endTime = "O término deve ser posterior ao início no mesmo dia.";
  }

  if (Object.keys(errors).length > 0 || !date || !startTime || !endTime || !formatter) {
    return { success: false, errors };
  }

  const startResolution = resolveLocalDateTime({ ...date, ...startTime }, formatter);
  if (startResolution.kind === "nonexistent") {
    errors.startTime = "Esse horário local não existe devido à mudança de fuso. Escolha outro horário.";
  } else if (startResolution.kind === "ambiguous") {
    errors.startTime = "Esse horário local é ambíguo devido à mudança de fuso. Escolha outro horário.";
  }

  const endResolution = resolveLocalDateTime({ ...date, ...endTime }, formatter);
  if (endResolution.kind === "nonexistent") {
    errors.endTime = "Esse horário local não existe devido à mudança de fuso. Escolha outro horário.";
  } else if (endResolution.kind === "ambiguous") {
    errors.endTime = "Esse horário local é ambíguo devido à mudança de fuso. Escolha outro horário.";
  }

  if (Object.keys(errors).length > 0) return { success: false, errors };

  if (startResolution.kind !== "resolved" || endResolution.kind !== "resolved") {
    return { success: false, errors: { timeZone: "Não foi possível interpretar os horários nesse fuso." } };
  }

  if (startResolution.instant <= now.getTime()) {
    return { success: false, errors: { date: "A disponibilidade deve começar no futuro." } };
  }

  if (endResolution.instant <= startResolution.instant) {
    return { success: false, errors: { endTime: "O término deve ser posterior ao início." } };
  }

  return {
    success: true,
    data: {
      sportId,
      startsAt: new Date(startResolution.instant).toISOString(),
      endsAt: new Date(endResolution.instant).toISOString(),
      timeZone,
    },
  };
}
