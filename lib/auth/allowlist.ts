export function parseAllowlist(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

export function isAllowedDmUid(uid: string | null, allowlist: string[]): boolean {
  if (!uid) return false;
  return allowlist.includes(uid);
}

export function getDmAllowlist(): string[] {
  return parseAllowlist(process.env.NEXT_PUBLIC_DM_UIDS);
}
