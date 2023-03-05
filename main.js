// Modules to control application life and create native browser window
const { app, BrowserWindow, powerSaveBlocker, ipcMain, dialog } = require("electron");
const path = require("path");
const { appDir } = require("./helpers/generalVariables");
const isDev = require("electron-is-dev");
const logger = require("./modules/logger.js");
// const { updater } = require("./modules/app_updater.js");
// const db = require("./modules/database");
const fs = require("fs");

// Hot Reload
if (isDev) {
  try {
    require("electron-reloader")(module, {
      debug: true,
      watchRenderer: true,
    });
  } catch {}
}

// -------- Logger --------------------------
// logger(appDirectory);
logger.logger(appDir);

//-------- Power save blocker---------------
powerSaveBlocker.start("prevent-display-sleep"); // prevent screen from sleeping

/** Define abort controller for dialog */
let abortDialog = new AbortController();

//-------- Connect to MongoDB---------------
// db.main().catch((err) => {
//   // if (err) console.log(err);
//   if (err) logger.mainLog.error(`DB error: ${err}`);
// });

function createWindow(width = null, height = null) {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: isDev ? 800 : width,
    height: isDev ? 600 : height,
    // show: false,
    autoHideMenuBar: !isDev,
    kiosk: isDev ? false : true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: true,
      allowRunningInsecureContent: true,
      webSecurity: false,
      enableRemoteModule: true,
    },
  });

  // and load the index.html of the app.
  // mainWindow.loadFile("./src/index.html");
  mainWindow.loadURL(`file://${__dirname}/src/index.html`);
  // mainWindow.loadURL(`file://${__dirname}/src/image-slider.html`);

  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // mainWindow.webContents.on("did-finish-load", () => {
  //   /**
  //    * Check the updater while the App is ready & no dev
  //    */
  //   if (!isDev) updater(mainWindow, app);
  // });

  /**
   * Define Dialog from Render process
   */
  ipcMain.handle("show-dialog", async (e, msg) => {
    if (msg) {
      if (abortDialog.signal.aborted) {
        abortDialog = new AbortController();
      }
      const result = await dialog.showMessageBox(mainWindow, { message: msg, title: "NZ Grass-fed Difference", signal: abortDialog.signal });
      return result;
    }
  });

  ipcMain.on("abort-dialog", (e, msg) => {
    console.log(msg);
    if (msg) abortDialog.abort();
  });
} /** CREATE WINDOW ENDS */

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const { screen } = require("electron");
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  createWindow(width, height);
  // createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    // if (BrowserWindow.getAllWindows().length === 0) createWindow();
    if (BrowserWindow.getAllWindows().length === 0) createWindow(width, height);
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on("app-version", (e, msg) => {
  if (msg) {
    e.returnValue = app.getVersion();
  }
});

ipcMain.on("is-dev", (e, msg) => {
  if (msg) {
    e.returnValue = isDev;
  }
});

ipcMain.on("appDir", (e, msg) => {
  if (msg) {
    e.returnValue = appDir;
  }
});

console.log(process.versions);
