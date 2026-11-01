declare class JsonStore {
    private tables;
    private fileFor;
    private load;
    private save;
    insert<T extends {
        id?: string;
    }>(name: string, item: Omit<T, "id"> & {
        id?: string;
    }): T;
    get<T>(name: string, id: string): T | null;
    list<T>(name: string): T[];
    update<T>(name: string, id: string, patch: Partial<T>): T | null;
    remove(name: string, id: string): boolean;
    query<T>(name: string, predicate: (row: T) => boolean): T[];
}
export declare const store: JsonStore;
export declare const COLLECTIONS: {
    readonly SESSIONS: "sessions";
    readonly TRANSCRIPT: "transcript_segments";
    readonly VISION: "vision_analyses";
    readonly QUESTIONS: "questions";
    readonly NOTES: "notes";
    readonly EXPORTS: "export_jobs";
    readonly ACTIVITY: "activity_events";
    readonly TRANSLATION: "translations";
    readonly TEAM_SHARE: "team_shares";
    readonly SETTINGS: "settings";
};
export {};
