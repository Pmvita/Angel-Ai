import { contextBridge, ipcRenderer } from "electron";

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
};

contextBridge.exposeInMainWorld("angelApi", {
  getSettings: () => ipcRenderer.invoke("get-settings"),
  setSettings: (settings: Record<string, unknown>) => ipcRenderer.invoke("set-settings", settings),
  toggleOverlay: () => ipcRenderer.invoke("toggle-overlay"),
  captureScreen: () => ipcRenderer.invoke("capture-screen"),
  openExternal: (url: string) => ipcRenderer.invoke("open-external", url),
  getLicense: () => ipcRenderer.invoke("get-license"),
  setLicense: (license: string) => ipcRenderer.invoke("set-license", license),
  clearLicense: () => ipcRenderer.invoke("clear-license"),
  onStatusChange: (cb: (status: string) => void) => {
    ipcRenderer.on("status-change", (_e, status) => cb(status));
  },
});

declare global {
  interface Window {
    angelApi: angelApi;
  }
}

