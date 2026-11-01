"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
const electron_store_1 = __importDefault(require("electron-store"));
const store = new electron_store_1.default({ name: "angel-settings" });
let serverProcess = null;
function startServer() {
    if (!electron_1.app.isPackaged)
        return; // dev: run server separately
    const serverEntry = node_path_1.default.join(process.resourcesPath, "app.asar.unpacked", "bundle", "server", "index.js");
    const altEntry = node_path_1.default.join(__dirname, "server", "index.js");
    const entry = require("node:fs").existsSync(serverEntry) ? serverEntry : altEntry;
    const dataDir = node_path_1.default.join(electron_1.app.getPath("userData"), "data");
    const fs = require("node:fs");
    fs.mkdirSync(dataDir, { recursive: true });
    const logPath = node_path_1.default.join(electron_1.app.getPath("userData"), "server-start.log");
    const log = (m) => { try {
        fs.appendFileSync(logPath, m + "\n");
    }
    catch { } };
    log("startServer called, packaged=" + electron_1.app.isPackaged);
    log("entry=" + entry + " exists=" + fs.existsSync(entry));
    serverProcess = electron_1.utilityProcess.fork(entry, [], {
        env: { ...process.env, PORT: "4000", angel_DATA_DIR: dataDir },
        stdio: "pipe",
    });
    log("forked, pid=" + serverProcess.pid);
    serverProcess.stdout?.on("data", (d) => log("OUT: " + d.toString()));
    serverProcess.stderr?.on("data", (d) => log("ERR: " + d.toString()));
    serverProcess.on("exit", (code) => { log("EXIT: " + code); serverProcess = null; });
}
function stopServer() {
    serverProcess?.kill();
    serverProcess = null;
}
let mainWindow = null;
let overlayWindow = null;
let tray = null;
function createMainWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1100,
        height: 700,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: node_path_1.default.join(__dirname, "preload.js"),
        },
    });
    if (process.env.NEXT_DEV_SERVER_URL || process.env.NODE_ENV === "development") {
        const url = process.env.NEXT_DEV_SERVER_URL || "http://localhost:3001";
        mainWindow.loadURL(url);
    }
    else {
        mainWindow.loadFile(node_path_1.default.join(process.resourcesPath, "app.asar.unpacked", "bundle", "web", "out", "index.html"));
    }
    mainWindow.once("ready-to-show", () => mainWindow?.show());
}
function createOverlayWindow() {
    const { width } = electron_1.screen.getPrimaryDisplay().workAreaSize;
    overlayWindow = new electron_1.BrowserWindow({
        x: width - 420,
        y: 80,
        width: 400,
        height: 620,
        alwaysOnTop: true,
        transparent: true,
        frame: false,
        focusable: true,
        skipTaskbar: store.get("settings.hideFromTaskbar", false),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: node_path_1.default.join(__dirname, "preload.js"),
        },
    });
    const isDev = !!(process.env.NEXT_DEV_SERVER_URL || process.env.NODE_ENV === "development");
    const baseUrl = process.env.NEXT_DEV_SERVER_URL || "http://localhost:3001";
    const url = isDev ? baseUrl : `file://${node_path_1.default.join(process.resourcesPath, "app.asar.unpacked", "bundle", "web", "out", "index.html")}`;
    overlayWindow.loadURL(url);
    overlayWindow.on("blur", () => {
        // keep invisible feel; do not minimize
    });
    return overlayWindow;
}
function createTray() {
    const icon = electron_1.nativeImage.createFromDataURL("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik04IDJDMTAuNzYxNCAyIDEzIDQuMjM4NTggMTMgNjdDMTMgOS43NjE0MiAxMC43NjE0IDEyIDggMTJDMNS4yMzg1OCAxMiAzIDkuNzYxNDIgMyA3QzMgNC4yMzg1OCA1LjIzODU4IDIgOCAyWk04IDQuNEM5LjEwNDU3IDQuNCAxMCA1LjUwNDU3IDEwIDZDMTAgNi40OTU0MyA5LjEwNDU3IDcuNiA4IDcuNkM2Ljg5NTQzIDcuNiA2IDYuNDk1NDMgNiA2QzYgNS41MDQ1NyA2Ljg5NTQzIDQuNCA4IDQuNlaIiBmaWxsPSIjMjJjNTVlIi8+Cjwvc3ZnPgo=");
    tray = new electron_1.Tray(icon);
    tray.setToolTip("angel AI — Invisible Assistant");
    tray.on("click", () => {
        if (overlayWindow)
            overlayWindow.isVisible() ? overlayWindow.hide() : overlayWindow.show();
    });
}
electron_1.app.whenReady().then(async () => {
    startServer();
    // give bundled server a moment to bind
    await new Promise((r) => setTimeout(r, 1500));
    createMainWindow();
    createOverlayWindow();
    createTray();
    if (electron_1.app.isPackaged) {
        // auto-update disabled until first GitHub release is published
        // autoUpdater.checkForUpdatesAndNotify().catch(() => {});
    }
    electron_1.globalShortcut.register("CmdOrCtrl+Shift+S", () => {
        if (overlayWindow) {
            overlayWindow.isVisible() ? overlayWindow.hide() : overlayWindow.show();
        }
    });
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createMainWindow();
    });
});
electron_1.app.on("window-all-closed", () => {
    stopServer();
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
electron_1.ipcMain.handle("get-settings", () => store.get("settings", {}));
electron_1.ipcMain.handle("set-settings", (_event, settings) => {
    store.set("settings", settings);
    if (overlayWindow)
        overlayWindow.setSkipTaskbar(!!settings.hideFromTaskbar);
    return { ok: true };
});
electron_1.ipcMain.handle("toggle-overlay", () => {
    if (overlayWindow) {
        overlayWindow.isVisible() ? overlayWindow.hide() : overlayWindow.show();
        return { visible: overlayWindow.isVisible() };
    }
    return { visible: false };
});
electron_1.ipcMain.handle("capture-screen", async () => {
    const sources = await electron_1.desktopCapturer.getSources({
        types: ["screen"],
        thumbnailSize: { width: 1280, height: 720 },
    });
    const primary = sources[0];
    if (!primary)
        return null;
    const png = primary.thumbnail.toPNG();
    return { png: png.toString("base64"), size: primary.thumbnail.getSize() };
});
electron_1.ipcMain.handle("get-license", () => store.get("license", null));
electron_1.ipcMain.handle("set-license", (_event, license) => {
    store.set("license", license);
    return { ok: true };
});
electron_1.ipcMain.handle("clear-license", () => {
    store.delete("license");
    return { ok: true };
});
electron_1.ipcMain.handle("open-external", (_event, url) => electron_1.shell.openExternal(url));
electron_1.ipcMain.handle("get-kill-switch", () => {
    const settings = store.get("settings", {});
    return settings.killSwitchEnabled ?? false;
});
electron_1.ipcMain.handle("set-kill-switch", (_event, enabled) => {
    const settings = store.get("settings", {});
    store.set("settings", { ...settings, killSwitchEnabled: enabled });
    if (enabled && overlayWindow)
        overlayWindow.hide();
    if (!enabled && overlayWindow)
        overlayWindow.show();
    return { ok: true, enabled };
});
