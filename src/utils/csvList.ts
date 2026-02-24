export function splitCsv(values: string[] = []): string[] {
  return values.flatMap((value) =>
    value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean),
  );
}
