export function newDateOrThrow(date: any): Date {
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    throw new Error(`invalid date ${date}`);
  }
  return parsed;
}

export function newOptionalDate(date: any): Date | undefined {
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed;
}
