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

export type PublicHost = Omit<Host, "passwordHash" | "email">;

const DB_PATH = path.join(process.cwd(), "data", "hosts.json");

function readDB(): { hosts: Host[] } {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { hosts: [] };
  }
}

function writeDB(data: { hosts: Host[] }) {
  const tmpPath = DB_PATH + ".tmp";
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmpPath, DB_PATH);
}

export function getAllHosts(): PublicHost[] {
  const { hosts } = readDB();
  return hosts.map(({ passwordHash: _p, email: _e, ...rest }) => rest);
}

export function getHostById(id: string): Host | null {
  const { hosts } = readDB();
  return hosts.find((h) => h.id === id) ?? null;
}

export function getHostByEmail(email: string): Host | null {
  const { hosts } = readDB();
  return hosts.find((h) => h.email.toLowerCase() === email.toLowerCase()) ?? null;
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
