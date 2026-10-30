import { app, BrowserWindow, ipcMain, globalShortcut, Tray, nativeImage, screen, shell } from "electron";
import path from "node:path";
import Store from "electron-store";
import { AppSettings } from "@angel/types";

const store = new Store<{ settings: Partial<AppSettings> }>({ name: "angel-settings" });

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

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../web/out/index.html"));
  }

  mainWindow.once("ready-to-show", () => mainWindow?.show());
}

function createOverlayWindow() {
  const { width } = screen.getPrimaryDisplay().workAreaSize;
  overlayWindow = new BrowserWindow({
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
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const url = process.env.VITE_DEV_SERVER_URL
    ? `${process.env.VITE_DEV_SERVER_URL}/overlay`
    : `file://${path.join(__dirname, "../web/out/overlay/index.html")}`;
  overlayWindow.loadURL(url);

  overlayWindow.on("blur", () => {
    // keep invisible feel; do not minimize
  });

  return overlayWindow;
}

function createTray() {
  const icon = nativeImage.createFromDataURL(
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik04IDJDMTAuNzYxNCAyIDEzIDQuMjM4NTggMTMgNjdDMTMgOS43NjE0MiAxMC43NjE0IDEyIDggMTJDMNS4yMzg1OCAxMiAzIDkuNzYxNDIgMyA3QzMgNC4yMzg1OCA1LjIzODU4IDIgOCAyWk04IDQuNEM5LjEwNDU3IDQuNCAxMCA1LjUwNDU3IDEwIDZDMTAgNi40OTU0MyA5LjEwNDU3IDcuNiA4IDcuNkM2Ljg5NTQzIDcuNiA2IDYuNDk1NDMgNiA2QzYgNS41MDQ1NyA2Ljg5NTQzIDQuNCA4IDQuNlaIiBmaWxsPSIjMjJjNTVlIi8+Cjwvc3ZnPgo="
  );
  tray = new Tray(icon);
  tray.setToolTip("angel AI — Invisible Assistant");
  tray.on("click", () => {
    if (overlayWindow) overlayWindow.isVisible() ? overlayWindow.hide() : overlayWindow.show();
  });
}

app.whenReady().then(() => {
  createMainWindow();
  createOverlayWindow();
  createTray();

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
  const [display] = screen.getAllDisplays();
  const thumbnail = await overlayWindow?.capturePage();
  if (!thumbnail) return null;
  const png = thumbnail.toPNG();
  return { png, size: { width: display.size.width, height: display.size.height } };
});
ipcMain.handle("open-external", (_event, url: string) => shell.openExternal(url));

ipcMain.handle("get-kill-switch", () => {
  const settings = store.get("settings", {});
  return settings.killSwitchEnabled ?? false;
});

ipcMain.handle("set-kill-switch", (_event, enabled: boolean) => {
  const settings = store.get("settings", {});
  store.set("settings", { ...settings, killSwitchEnabled: enabled });
  return { ok: true, enabled };
});

