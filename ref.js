"use strict";
const path = require("path");
const { app, BrowserWindow, Menu, screen } = require("electron");
/// const {autoUpdater} = require('electron-updater');
const { is } = require("electron-util");
const unhandled = require("electron-unhandled");
const debug = require("electron-debug");
const contextMenu = require("electron-context-menu");
const config = require("./config.js");
const menu = require("./menu.js");
const isDev = require("electron-is-dev");
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

unhandled();
debug();
contextMenu();

// Note: Must match `build.appId` in package.json
app.setAppUserModelId("com.company.AppName");

// Enable live reload for Electron too
/*
if (isDev) {
	require("electron-reload")(__dirname, {
		// Note that the path to electron may vary according to the main file
		electron: require(`${__dirname}/node_modules/electron`),
	});
}
*/
// Uncomment this before publishing your first version.
// It's commented out as it throws an error if there are no published versions.
// if (!is.development) {
// 	const FOUR_HOURS = 1000 * 60 * 60 * 4;
// 	setInterval(() => {
// 		autoUpdater.checkForUpdates();
// 	}, FOUR_HOURS);
//
// 	autoUpdater.checkForUpdates();
// }

// Prevent window from being garbage collected
let mainWindow;

const createMainWindow = async () => {
  const win = new BrowserWindow({
    title: app.name,
    show: false,
    width: 600,
    height: 400,
    kiosk: isDev ? false : true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  // if (!isDev) {
  win.removeMenu();
  // }

  win.setAlwaysOnTop(true, "screen-saver");

  win.on("ready-to-show", () => {
    win.show();
  });

  win.on("closed", () => {
    // Dereference the window
    // For multiple windows store them in an array
    mainWindow = undefined;
  });

  await win.loadFile(path.join(__dirname, "./app/block_a.html"));

  const webContents = win.webContents;
  webContents.on("did-finish-load", () => {
    webContents.setZoomFactor(1);
    // webContents.setVisualZoomLevelLimits(1, 1);
    // webContents.setLayoutZoomLevelLimits(0, 0);
  });

  return win;
};

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

app.on("second-instance", () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    mainWindow.show();
  }
});

app.on("window-all-closed", () => {
  if (!is.macos) {
    app.quit();
  }
});

app.on("activate", async () => {
  if (!mainWindow) {
    mainWindow = await createMainWindow();
  }
});

let secondWin;

(async () => {
  // await app.whenReady();
  await app.whenReady().then(() => {
    const displays = screen.getAllDisplays();
    const externalDisplay = displays.find((display) => {
      return display.bounds.x !== 0 || display.bounds.y !== 0;
    });
    if (externalDisplay) {
      secondWin = new BrowserWindow({
        x: externalDisplay.bounds.x + 50,
        y: externalDisplay.bounds.y + 50,
        kiosk: isDev ? false : true,
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          enableRemoteModule: true,
        },
      });

      // secondWin.removeMenu();

      secondWin.setAlwaysOnTop(true, "screen-saver");

      secondWin.loadFile(path.join(__dirname, "./app/block_b.html"));
      // disable zoom
      const webContents = secondWin.webContents;
      webContents.on("did-finish-load", () => {
        webContents.setZoomFactor(1);
        // webContents.setVisualZoomLevelLimits(1, 1);
        // webContents.setLayoutZoomLevelLimits(0, 0);
      });
    }
  });
  Menu.setApplicationMenu(menu);
  mainWindow = await createMainWindow();

  // const favoriteAnimal = config.get("favoriteAnimal");
  // mainWindow.webContents.executeJavaScript(
  // 	`document.querySelector('header p').textContent = 'Your favorite animal is ${favoriteAnimal}'`
  // );
})();
