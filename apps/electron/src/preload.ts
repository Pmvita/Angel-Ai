import { contextBridge, ipcRenderer } from "electron";

export type angelApi = {
  getSettings: () => Promise<unknown>;
  setSettings: (settings: Record<string, unknown>) => Promise<unknown>;
  toggleOverlay: () => Promise<unknown>;
  captureScreen: () => Promise<unknown>;
  openExternal: (url: string) => Promise<unknown>;
  onStatusChange: (cb: (status: string) => void) => void;
};

contextBridge.exposeInMainWorld("angelApi", {
  getSettings: () => ipcRenderer.invoke("get-settings"),
  setSettings: (settings: Record<string, unknown>) => ipcRenderer.invoke("set-settings", settings),
  toggleOverlay: () => ipcRenderer.invoke("toggle-overlay"),
  captureScreen: () => ipcRenderer.invoke("capture-screen"),
  openExternal: (url: string) => ipcRenderer.invoke("open-external", url),
  onStatusChange: (cb: (status: string) => void) => {
    ipcRenderer.on("status-change", (_e, status) => cb(status));
  },
});

declare global {
  interface Window {
    angelApi: angelApi;
  }
}

