export type angelApi = {
    getSettings: () => Promise<unknown>;
    setSettings: (settings: Record<string, unknown>) => Promise<unknown>;
    toggleOverlay: () => Promise<unknown>;
    captureScreen: () => Promise<unknown>;
    openExternal: (url: string) => Promise<unknown>;
    getLicense: () => Promise<string | null>;
    setLicense: (license: string) => Promise<unknown>;
    clearLicense: () => Promise<unknown>;
    onStatusChange: (cb: (status: string) => void) => void;
    dragStart: (x: number, y: number) => Promise<unknown>;
    dragMove: (x: number, y: number) => Promise<unknown>;
};
declare global {
    interface Window {
        angelApi: angelApi;
    }
}
