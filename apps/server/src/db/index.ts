import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.env.angel_DATA_DIR || process.cwd(), "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

type Table = Record<string, any>;

class JsonStore {
  private tables: Map<string, Table> = new Map();

  private fileFor(name: string) {
    return path.join(DATA_DIR, `${name}.json`);
  }

  private load(name: string): Table {
    if (this.tables.has(name)) return this.tables.get(name)!;
    const file = this.fileFor(name);
    let data: Table = {};
    if (fs.existsSync(file)) {
      try {
        data = JSON.parse(fs.readFileSync(file, "utf8"));
      } catch {
        data = {};
      }
    }
    this.tables.set(name, data);
    return data;
  }

  private save(name: string) {
    const data = this.tables.get(name);
    if (!data) return;
    fs.writeFileSync(this.fileFor(name), JSON.stringify(data, null, 2));
  }

  insert<T extends { id?: string }>(name: string, item: Omit<T, "id"> & { id?: string }): T {
    const data = this.load(name);
    const id = item.id || crypto.randomUUID();
    const row = { ...item, id } as T;
    data[id] = row;
    this.save(name);
    return row;
  }

  get<T>(name: string, id: string): T | null {
    const data = this.load(name);
    return data[id] ?? null;
  }

  list<T>(name: string): T[] {
    const data = this.load(name);
    return Object.values(data);
  }

  update<T>(name: string, id: string, patch: Partial<T>): T | null {
    const data = this.load(name);
    const existing = data[id];
    if (!existing) return null;
    const row = { ...existing, ...patch } as T;
    data[id] = row;
    this.save(name);
    return row;
  }

  remove(name: string, id: string): boolean {
    const data = this.load(name);
    if (!data[id]) return false;
    delete data[id];
    this.save(name);
    return true;
  }

  query<T>(name: string, predicate: (row: T) => boolean): T[] {
    return this.list<T>(name).filter(predicate);
  }
}

export const store = new JsonStore();

export const COLLECTIONS = {
  SESSIONS: "sessions",
  TRANSCRIPT: "transcript_segments",
  VISION: "vision_analyses",
  QUESTIONS: "questions",
  NOTES: "notes",
  EXPORTS: "export_jobs",
  ACTIVITY: "activity_events",
  TRANSLATION: "translations",
  TEAM_SHARE: "team_shares",
  SETTINGS: "settings",
} as const;

