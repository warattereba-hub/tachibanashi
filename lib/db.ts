import fs from "fs";
import path from "path";

export interface Host {
  id: string;
  email: string;
  passwordHash: string;
  placeName: string;
  location: string;
  lat: number | null;
  lng: number | null;
  hookSentence: string;
  tags: string[];
  hostMessage: string;
  passphrase: string;
  photoBase64: string | null;
  status: "active" | "rest";
  createdAt: number;
}

// Visible to anyone — never include credentials or the passphrase itself.
export interface PublicHost {
  id: string;
  placeName: string;
  location: string;
  lat: number | null;
  lng: number | null;
  hookSentence: string;
  tags: string[];
  hostMessage: string;
  hasPassphrase: boolean;
  photoBase64: string | null;
  status: "active" | "rest";
  createdAt: number;
}

// Lightweight shape for the map pin list (no photos — keeps the payload small).
export interface HostPin {
  id: string;
  placeName: string;
  location: string;
  hookSentence: string;
  status: "active" | "rest";
  lat: number | null;
  lng: number | null;
}

const DB_PATH = path.join(process.cwd(), "data", "hosts.json");

export function toPublicHost(h: Host): PublicHost {
  return {
    id: h.id,
    placeName: h.placeName,
    location: h.location,
    lat: h.lat ?? null,
    lng: h.lng ?? null,
    hookSentence: h.hookSentence ?? "",
    tags: h.tags ?? [],
    hostMessage: h.hostMessage ?? "",
    hasPassphrase: Boolean(h.passphrase?.trim()),
    photoBase64: h.photoBase64 ?? null,
    status: h.status ?? "active",
    createdAt: h.createdAt ?? 0,
  };
}

export function toHostPin(h: Host): HostPin {
  return {
    id: h.id,
    placeName: h.placeName,
    location: h.location,
    hookSentence: h.hookSentence ?? "",
    status: h.status ?? "active",
    lat: h.lat ?? null,
    lng: h.lng ?? null,
  };
}

function readDB(): { hosts: Host[] } {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return { hosts: Array.isArray(parsed?.hosts) ? parsed.hosts : [] };
  } catch {
    return { hosts: [] };
  }
}

function writeDB(data: { hosts: Host[] }) {
  const tmpPath = DB_PATH + ".tmp";
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmpPath, DB_PATH);
}

export function getAllHostPins(): HostPin[] {
  const { hosts } = readDB();
  return hosts.map(toHostPin);
}

export function getHostById(id: string): Host | null {
  const { hosts } = readDB();
  return hosts.find((h) => h.id === id) ?? null;
}

export function getHostByEmail(email: string): Host | null {
  const { hosts } = readDB();
  // Seed hosts may not have an email — guard against undefined.
  return hosts.find((h) => h.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

export function createHost(host: Host): void {
  const db = readDB();
  db.hosts.push(host);
  writeDB(db);
}

export function updateHost(id: string, updates: Partial<Host>): Host | null {
  const db = readDB();
  const idx = db.hosts.findIndex((h) => h.id === id);
  if (idx === -1) return null;
  db.hosts[idx] = { ...db.hosts[idx], ...updates };
  writeDB(db);
  return db.hosts[idx];
}
