// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  powerSaveBlocker,
  ipcMain,
  dialog,
  globalShortcut,
} = require("electron");
const path = require("path");
const { appDir } = require("./helpers/generalVariables");
const isDev = require("electron-is-dev");
const logger = require("./modules/logger.js");
// const { updater } = require("./modules/app_updater.js");
// const db = require("./modules/database");
const fs = require("fs");
const Storage = require("./modules/Storage");

const storage = new Storage();
storage.init();

app.commandLine.appendSwitch("enable-features", "ElectronSerialChooser");

// Hot Reload
if (isDev) {
  try {
    require("electron-reloader")(module, {
      // debug: true,
      watchRenderer: true,
    });
  } catch {}
}

// -------- INDEX PAGE --------------------------
// const index_page =`file://${__dirname}/src/index_surface.html`
const index_page = `./src/index_surface.html`;
// const index_page = `./src/error.html`;

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
let firstWin;
let windows = [];

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
      enableBlinkFeatures: "Serial",
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(index_page);
  // mainWindow.loadFile("./src/index_surface.html");
  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.setAlwaysOnTop(true, "screen-saver");
  }

  mainWindow.webContents.on("did-finish-load", () => {
    /**
     * Check the updater while the App is ready & no dev
     */
    // if (!isDev) updater(mainWindow, app);
    focusInMiliseconds(windows[1]);
  });

  /**
   * Define Dialog from Render process
   */
  ipcMain.handle("show-dialog", async (e, msg) => {
    if (msg) {
      const result = await dialog.showMessageBox(mainWindow, {
        message: msg,
        title: "New Zealand Rugby Museum",
      });
      return result;
    }
  });

  /** 
  ipcMain.handle("show-dialog", async (e, msg) => {
    if (msg) {
      if (abortDialog.signal.aborted) {
        abortDialog = new AbortController();
      }
      const result = await dialog.showMessageBox(mainWindow, { message: msg, title: "NZ Grass-fed Difference", signal: abortDialog.signal });
      return result;
    }
  });

  ipcMain.on("show-dialog", (e, msg) => {
    if (msg)
      dialog.showMessageBox(mainWindow, {
        title: "NZ Grass-fed Difference",
        message: msg,
      });
  });
*/

  ipcMain.on("abort-dialog", (e, msg) => {
    console.log(msg);
    if (msg) abortDialog.abort();
  });

  mainWindow.webContents.session.on(
    "select-serial-port",
    (event, portList, webContents, callback) => {
      console.log("SELECT-SERIAL-PORT FIRED WITH", portList);
      event.preventDefault();
      let selectedPort = portList.find((device) => {
        // Automatically pick a specific device instead of prompting user
        //return device.vendorId == 0x2341 && device.productId == 0x0043;

        // Automatically return the first device
        return true;
      });
      if (!selectedPort) {
        callback("");
      } else {
        callback(selectedPort.portId);
      }
    }
  );

  // console.log(mainWindow);
  windows = [...windows, mainWindow];
  firstWin = windows[0]; // set the 1st window
  // console.log(windows);
} /** CREATE WINDOW ENDS */

/**
 * ################################################################################
 *                               Second window
 * ################################################################################
 */
let secondWin;
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const { screen } = require("electron");
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  let displays = screen.getAllDisplays();
  let externalDisplay = displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0;
  });

  /* 
  console.log("#####################################");
  console.log(externalDisplay);
  console.log("#####################################");
  */
  if (externalDisplay) {
    secondWin = new BrowserWindow({
      x: externalDisplay.bounds.x + 50,
      y: externalDisplay.bounds.y + 50,
      autoHideMenuBar: !isDev,
      kiosk: isDev ? false : true,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        nodeIntegration: true,
        allowRunningInsecureContent: true,
        webSecurity: false,
        enableRemoteModule: true,
        enableBlinkFeatures: "Serial",
      },
    });

    if (isDev) {
      // console.log(secondWin);
      secondWin.webContents.openDevTools();
    } else {
      secondWin.setAlwaysOnTop(true, "screen-saver");
    }

    secondWin.loadURL(`file://${__dirname}/src/index_tv.html`);
    windows = [...windows, secondWin];

    // secondWin.webContents.on("did-finish-load", () => {
    //   firstWin.focus();
    //   console.log("### Focus on the 1st window ###");
    // });
  }

  createWindow(width, height);

  console.log("LENGTH>>>>", windows.length);

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow(width, height);
  });

  /**
   * Register shortcut
   */
  // globalShortcut.register("S", () => {
  //   console.log("#### Send start game signal ###");
  //   sendSignalFunction()
  // });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

/**
 * Set the focus on main window (first window)
 */
// secondWin.on("show", () => {
//   focusInMiliseconds(firstWin);
// });

const focusInMiliseconds = (window, ms = 200) => {
  setTimeout(() => {
    // console.log(window);
    window.focus();
  }, ms);
};

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

ipcMain.on("top_speed", (e, msg) => {
  if (msg) {
    console.log("### Top speed from renderer: ", msg);
    // secondWin.webContents.send("top_speed", msg);
    windows[0].webContents.send("top_speed", msg);
    windows[1].webContents.send("top_speed", msg);
  }
});

ipcMain.on("reset-top-speed", (e, msg) => {
  if (msg) {
    firstWin.webContents.send("reset-top-speed", "testing");
    secondWin.webContents.send("reset-top-speed", "testing");
    console.log("### Top speed reset signal ###");
  }
});

ipcMain.on("start-game", (e, msg) => {
  // let args = ("start-game", 1);
  if (msg) {
    // firstWin.webContents.send("start-game", 1);
    // secondWin.webContents.send("start-game", 1);
    windows[0].webContents.send("start-game", 1);
    windows[1].webContents.send("start-game", 1);
    console.log("### Start game signal ###");
  }
});

ipcMain.on("go-home", (e, msg) => {
  if (msg) {
    windows[0].webContents.send("go-home", 1);
    windows[1].webContents.send("go-home", 1);
    console.log("### Go home signal ###");
  }
});

ipcMain.on("top-speed-toggle", (e, msg) => {
  if (msg) {
    windows[0].webContents.send("top-speed-toggle", msg);
    windows[1].webContents.send("top-speed-toggle", msg);
    console.log("### Top speed toggle ###");
  }
});

ipcMain.on("display-error-message", (e, msg) => {
  if (msg) {
    windows[0].webContents.send("display-error-message", msg);
    windows[1].webContents.send("display-error-message", msg);
    console.log("### Display Error Message ###");
  }
});

ipcMain.on("stop-sending-speed", (e, msg) => {
  if (msg) {
    windows[0].webContents.send("stop-sending-speed", msg);
    windows[1].webContents.send("stop-sending-speed", msg);
    console.log("### stop-sending-speed ###");
  }
});
