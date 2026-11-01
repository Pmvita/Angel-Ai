import { app, BrowserWindow, ipcMain, globalShortcut, Tray, nativeImage, screen, shell, desktopCapturer, utilityProcess, Menu } from "electron";
import path from "node:path";
import { spawn, ChildProcess } from "node:child_process";
import Store from "electron-store";
import { autoUpdater } from "electron-updater";
import { AppSettings } from "@angel/types";

const store = new Store<{ settings: Partial<AppSettings>; license?: string | null }>({ name: "angel-settings" });

let serverProcess: any = null;

function startServer() {
  if (!app.isPackaged) return; // dev: run server separately
  const serverEntry = path.join(process.resourcesPath, "app.asar.unpacked", "bundle", "server", "index.js");
  const altEntry = path.join(__dirname, "server", "index.js");
  const entry = require("node:fs").existsSync(serverEntry) ? serverEntry : altEntry;
  const dataDir = path.join(app.getPath("userData"), "data");
  const fs = require("node:fs");
  fs.mkdirSync(dataDir, { recursive: true });
  const logPath = path.join(app.getPath("userData"), "server-start.log");
  const log = (m: string) => { try { fs.appendFileSync(logPath, m + "\n"); } catch {} };
  log("startServer called, packaged=" + app.isPackaged);
  log("entry=" + entry + " exists=" + fs.existsSync(entry));
  serverProcess = utilityProcess.fork(entry, [], {
    env: { ...process.env, PORT: "4000", angel_DATA_DIR: dataDir },
    stdio: "pipe",
  });
  log("forked, pid=" + serverProcess.pid);
  serverProcess.stdout?.on("data", (d: Buffer) => log("OUT: " + d.toString()));
  serverProcess.stderr?.on("data", (d: Buffer) => log("ERR: " + d.toString()));
  serverProcess.on("exit", (code: number) => { log("EXIT: " + code); serverProcess = null; });
}

function stopServer() {
  serverProcess?.kill();
  serverProcess = null;
}

let mainWindow: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (process.env.NEXT_DEV_SERVER_URL || process.env.NODE_ENV === "development") {
    const url = process.env.NEXT_DEV_SERVER_URL || "http://localhost:3001";
    mainWindow.loadURL(url);
  } else {
    mainWindow.loadFile(path.join(process.resourcesPath, "app.asar.unpacked", "bundle", "web", "out", "index.html"));
  }

  mainWindow.once("ready-to-show", () => { /* keep hidden; shown via tray */ });
}

function createOverlayWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  overlayWindow = new BrowserWindow({
    x: Math.round((width - 400) / 2),
    y: Math.round((height - 620) / 2),
    width: 400,
    height: 620,
    alwaysOnTop: true,
    transparent: false,
    frame: false,
    backgroundColor: "#1a1a1a",
    focusable: true,
    skipTaskbar: store.get("settings.hideFromTaskbar", false),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const isDev = !!(process.env.NEXT_DEV_SERVER_URL || process.env.NODE_ENV === "development");
  const baseUrl = process.env.NEXT_DEV_SERVER_URL || "http://localhost:3001";
  const url = isDev ? baseUrl : `file://${path.join(process.resourcesPath, "app.asar.unpacked", "bundle", "web", "out", "index.html")}`;
  overlayWindow.loadURL(url);

  overlayWindow.on("blur", () => {
    // keep invisible feel; do not minimize
  });

  return overlayWindow;
}

function showMainWindow() {
  if (!mainWindow) {
    createMainWindow();
  }
  mainWindow?.show();
  mainWindow?.focus();
}

function createTray() {
  const icon = nativeImage.createFromDataURL(
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik04IDJDMTAuNzYxNCAyIDEzIDQuMjM4NTggMTMgNjdDMTMgOS43NjE0MiAxMC43NjE0IDEyIDggMTJDMNS4yMzg1OCAxMiAzIDkuNzYxNDIgMyA3QzMgNC4yMzg1OCA1LjIzODU4IDIgOCAyWk04IDQuNEM5LjEwNDU3IDQuNCAxMCA1LjUwNDU3IDEwIDZDMTAgNi40OTU0MyA5LjEwNDU3IDcuNiA4IDcuNkM2Ljg5NTQzIDcuNiA2IDYuNDk1NDMgNiA2QzYgNS41MDQ1NyA2Ljg5NTQzIDQuNCA4IDQuNlaIiBmaWxsPSIjMjJjNTVlIi8+Cjwvc3ZnPgo="
  );
  tray = new Tray(icon);
  tray.setToolTip("Angel-Ai — Invisible Assistant");

  const contextMenu = Menu.buildFromTemplate([
    { label: "Toggle Overlay", click: () => { if (overlayWindow) overlayWindow.isVisible() ? overlayWindow.hide() : overlayWindow.show(); } },
    { label: "Toggle Main Window", click: () => { if (mainWindow && mainWindow.isVisible()) mainWindow.hide(); else showMainWindow(); } },
    { type: "separator" },
    { label: "Show Both", click: () => { overlayWindow?.show(); mainWindow?.show(); } },
    { label: "Hide All", click: () => { overlayWindow?.hide(); mainWindow?.hide(); } },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    if (overlayWindow) overlayWindow.isVisible() ? overlayWindow.hide() : overlayWindow.show();
  });
}

app.whenReady().then(async () => {
  startServer();
  // give bundled server a moment to bind
  await new Promise((r) => setTimeout(r, 1500));
  createMainWindow();
  createOverlayWindow();
  createTray();
  // Show only the overlay on launch; main window stays hidden until requested via tray.
  overlayWindow?.show();
  overlayWindow?.focus();

  if (app.isPackaged) {
    // Check for updates on GitHub releases
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.checkForUpdatesAndNotify().catch(() => {});
    autoUpdater.on("update-available", (info) => {
      console.log("Update available:", info.version);
    });
    autoUpdater.on("update-downloaded", (info) => {
      console.log("Update downloaded:", info.version);
      // Notify via tray or dialog
      const { dialog } = require("electron");
      dialog.showMessageBox({
        type: "info",
        title: "Update Ready",
        message: `Angel-Ai ${info.version} has been downloaded. It will be installed when you quit the app.`,
        buttons: ["OK"],
      });
    });
    autoUpdater.on("error", (err) => {
      console.error("Auto-update error:", err);
    });
  }

  globalShortcut.register("CmdOrCtrl+Shift+S", () => {
    if (overlayWindow) {
      overlayWindow.isVisible() ? overlayWindow.hide() : overlayWindow.show();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", () => {
  stopServer();
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("get-settings", () => store.get("settings", {}));
ipcMain.handle("set-settings", (_event, settings: Partial<AppSettings>) => {
  store.set("settings", settings);
  if (overlayWindow) overlayWindow.setSkipTaskbar(!!settings.hideFromTaskbar);
  return { ok: true };
});
ipcMain.handle("toggle-overlay", () => {
  if (overlayWindow) {
    overlayWindow.isVisible() ? overlayWindow.hide() : overlayWindow.show();
    return { visible: overlayWindow.isVisible() };
  }
  return { visible: false };
});
ipcMain.handle("capture-screen", async () => {
  const sources = await desktopCapturer.getSources({
    types: ["screen"],
    thumbnailSize: { width: 1280, height: 720 },
  });
  const primary = sources[0];
  if (!primary) return null;
  const png = primary.thumbnail.toPNG();
  return { png: png.toString("base64"), size: primary.thumbnail.getSize() };
});
ipcMain.handle("get-license", () => store.get("license", null));
ipcMain.handle("set-license", (_event, license: string) => {
  store.set("license", license);
  return { ok: true };
});
ipcMain.handle("clear-license", () => {
  store.delete("license");
  return { ok: true };
});

ipcMain.handle("open-external", (_event, url: string) => shell.openExternal(url));

ipcMain.handle("get-kill-switch", () => {
  const settings = store.get("settings", {});
  return settings.killSwitchEnabled ?? false;
});

ipcMain.handle("set-kill-switch", (_event, enabled: boolean) => {
  const settings = store.get("settings", {});
  store.set("settings", { ...settings, killSwitchEnabled: enabled });
  if (enabled && overlayWindow) overlayWindow.hide();
  if (!enabled && overlayWindow) overlayWindow.show();
  return { ok: true, enabled };
});

let dragOffset = { x: 0, y: 0 };

ipcMain.handle("drag-start", (event, { x, y }: { x: number; y: number }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return { ok: false };
  const bounds = win.getBounds();
  dragOffset = { x: x - bounds.x, y: y - bounds.y };
  return { ok: true };
});

ipcMain.handle("drag-move", (event, { x, y }: { x: number; y: number }) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return { ok: false };
  win.setPosition(x - dragOffset.x, y - dragOffset.y);
  return { ok: true };
});

