"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("angelApi", {
    getSettings: () => electron_1.ipcRenderer.invoke("get-settings"),
    setSettings: (settings) => electron_1.ipcRenderer.invoke("set-settings", settings),
    toggleOverlay: () => electron_1.ipcRenderer.invoke("toggle-overlay"),
    captureScreen: () => electron_1.ipcRenderer.invoke("capture-screen"),
    openExternal: (url) => electron_1.ipcRenderer.invoke("open-external", url),
    getLicense: () => electron_1.ipcRenderer.invoke("get-license"),
    setLicense: (license) => electron_1.ipcRenderer.invoke("set-license", license),
    clearLicense: () => electron_1.ipcRenderer.invoke("clear-license"),
    onStatusChange: (cb) => {
        electron_1.ipcRenderer.on("status-change", (_e, status) => cb(status));
    },
    dragStart: (x, y) => electron_1.ipcRenderer.invoke("drag-start", { x, y }),
    dragMove: (x, y) => electron_1.ipcRenderer.invoke("drag-move", { x, y }),
});
