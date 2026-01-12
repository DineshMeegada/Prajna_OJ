export function toDisplayTitle(raw: string): string {
  if (!raw) return "";
  const spaced = raw.replaceAll("_", " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

