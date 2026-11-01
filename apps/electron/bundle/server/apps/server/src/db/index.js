"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLLECTIONS = exports.store = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const DATA_DIR = node_path_1.default.join(process.env.angel_DATA_DIR || process.cwd(), "data");
node_fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
class JsonStore {
    tables = new Map();
    fileFor(name) {
        return node_path_1.default.join(DATA_DIR, `${name}.json`);
    }
    load(name) {
        if (this.tables.has(name))
            return this.tables.get(name);
        const file = this.fileFor(name);
        let data = {};
        if (node_fs_1.default.existsSync(file)) {
            try {
                data = JSON.parse(node_fs_1.default.readFileSync(file, "utf8"));
            }
            catch {
                data = {};
            }
        }
        this.tables.set(name, data);
        return data;
    }
    save(name) {
        const data = this.tables.get(name);
        if (!data)
            return;
        node_fs_1.default.writeFileSync(this.fileFor(name), JSON.stringify(data, null, 2));
    }
    insert(name, item) {
        const data = this.load(name);
        const id = item.id || crypto.randomUUID();
        const row = { ...item, id };
        data[id] = row;
        this.save(name);
        return row;
    }
    get(name, id) {
        const data = this.load(name);
        return data[id] ?? null;
    }
    list(name) {
        const data = this.load(name);
        return Object.values(data);
    }
    update(name, id, patch) {
        const data = this.load(name);
        const existing = data[id];
        if (!existing)
            return null;
        const row = { ...existing, ...patch };
        data[id] = row;
        this.save(name);
        return row;
    }
    remove(name, id) {
        const data = this.load(name);
        if (!data[id])
            return false;
        delete data[id];
        this.save(name);
        return true;
    }
    query(name, predicate) {
        return this.list(name).filter(predicate);
    }
}
exports.store = new JsonStore();
exports.COLLECTIONS = {
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
};
