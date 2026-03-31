const STATUS_KEY = "tnsh_host_status";
const PHRASE_KEY = "tnsh_passphrase";

export type HostStatus = "active" | "rest";

export function getHostStatus(): HostStatus {
  if (typeof window === "undefined") return "active";
  return (localStorage.getItem(STATUS_KEY) as HostStatus) ?? "active";
}

export function setHostStatus(s: HostStatus) {
  localStorage.setItem(STATUS_KEY, s);
}

export function getPassphrase(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PHRASE_KEY);
}

export function savePassphrase(value: string) {
  localStorage.setItem(PHRASE_KEY, value.trim());
}

export function verifyPassphrase(input: string): boolean {
  const stored = getPassphrase();
  if (!stored) return false;
  return stored.toLowerCase() === input.trim().toLowerCase();
}
