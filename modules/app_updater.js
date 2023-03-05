const { ipcMain } = require("electron");
// const log = require("electron-log");
const { autoUpdater } = require("electron-updater");
const shutdown = require("electron-shutdown-command");
const { updateLog } = require("./logger");
const { rebootUnit, rebootApp } = require("./powerManagement");
const { platform } = require("../helpers/generalVariables");

let updateChannel, version;
const updater = (mainWindow = null, app = null) => {
  //-------------------------------------------------------------------
  // Define update channel from Renderer process
  //-------------------------------------------------------------------
  /**
   * # Define the update channel depends on the app version #
   * #######################################################
   */
  version = app.getVersion();

  switch (true) {
    case version.includes("alpha"):
      updateChannel = "alpha";
      break;
    case version.includes("beta"):
      updateChannel = "beta";
      break;
    case version.includes("latest"):
      updateChannel = "latest";
      break;
    default:
      updateChannel = "latest";
      break;
  }

  if (mainWindow) {
    updateLog.info(app.getVersion());
    // ipcMain.on("app-version", (e, msg) => {
    //   console.log("************************************** REGISTERED");
    //   if (msg) {
    //     e.returnValue = version;
    //   }
    // });
    // mainWindow.webContents.send("app-version", app.getVersion());
  }

  autoUpdater.channel = updateChannel;
  // if (process.platform !== "win32") {
  updateLog.info(`### Update channel: ${updateChannel}`);
  /**
   * # Check the update after 30 seconds because waiting for the Wifi #
   * # Next step would be check wifi and run the function until the wifi is connected #
   * ##################################################################################
   */
  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, 30000);
  // } else {
  //   updateLog.info("### Windows machine, do not check the update.");
  // }
  // ipcMain.on("update-channel", (e, msg) => {

  // });

  //-------------------------------------------------------------------
  // Logging
  //
  // THIS SECTION IS NOT REQUIRED
  //
  // This logging setup is not required for auto-updates to work,
  // but it sure makes debugging easier :)
  //-------------------------------------------------------------------
  // autoUpdater.logger = updateLog;
  // autoUpdater.logger.transports.file.level = "info";
  updateLog.info("App starting...");

  //-------------------------------------------------------------------
  //   Sending information to the render process
  //-------------------------------------------------------------------
  const sendStatusToRender = (msg, logType) => {
    // log.info(msg);
    if (msg === " ") msg = "Update not available.";
    switch (logType) {
      case 1:
        // debug
        updateLog.debug(msg);
        break;
      case 2:
        // warn
        updateLog.warn(msg);
        break;
      case 3:
        // error
        updateLog.error(msg);
        break;
      default:
        // info
        updateLog.info(msg);
        break;
    }
    if (mainWindow) mainWindow.webContents.send("messages", msg);
  };

  autoUpdater.on("checking-for-update", () => {
    sendStatusToRender("Checking for update...");
  });
  autoUpdater.on("update-available", (ev, info) => {
    sendStatusToRender("Update available.");
  });
  autoUpdater.on("update-not-available", (ev, info) => {
    // sendStatusToRender("Update not available.");
    sendStatusToRender(" ");
  });
  autoUpdater.on("error", (ev, err) => {
    sendStatusToRender(
      `Error in auto-updater. ${err}. Retry in 30 seconds.`,
      3
    );
    setTimeout(() => {
      autoUpdater.checkForUpdates();
    }, 30000);
  });
  autoUpdater.on("download-progress", (ev, progressObj) => {
    sendStatusToRender("Download progress... " + ev.percent.toFixed(2) + "%");
  });
  autoUpdater.on("update-downloaded", (ev, info) => {
    sendStatusToRender(
      "Update downloaded; will install and reboot the machine in 15 seconds"
    );
  });

  //-------------------------------------------------------------------
  // Auto updates
  //
  // For details about these events, see the Wiki:
  // https://github.com/electron-userland/electron-builder/wiki/Auto-Update#events
  //
  // The app doesn't need to listen to any events except `update-downloaded`
  //
  // Uncomment any of the below events to listen for them.  Also,
  // look in the previous section to see them being used.
  //-------------------------------------------------------------------
  // autoUpdater.on('checking-for-update', () => {
  // })
  // autoUpdater.on('update-available', (ev, info) => {
  // })
  // autoUpdater.on('update-not-available', (ev, info) => {
  // })
  // autoUpdater.on('error', (ev, err) => {
  // })
  // autoUpdater.on('download-progress', (ev, progressObj) => {
  // })
  autoUpdater.on("update-downloaded", (ev, info) => {
    // Wait 5 seconds, then quit and install
    // In your application, you don't need to wait 5 seconds.
    // You could call autoUpdater.quitAndInstall(); immediately
    setTimeout(function () {
      sendStatusToRender("App installed & reboot now.");
      autoUpdater.quitAndInstall(true, true);
      // rebootUnit();
      /**
      app.quit(); // quit the app
      shutdown.reboot(); // reboot the machine and hopefully the app will update
       */
    }, 15000);
  });

  //-------------------------------------------------------------------
  //   Start the updater
  //-------------------------------------------------------------------
  //   app.on("ready", function () {});
  // autoUpdater.channel = updateChannel;
  // autoUpdater.checkForUpdates();
}; // updater

/**
 * CHECK APP UPDATE FROM RENDERER
 */
ipcMain.on("check-update", (e, msg) => {
  if (msg) {
    // console.log(updateChannel);
    autoUpdater.channel = updateChannel;
    // if (process.platform !== "win32") {
    console.log(`### Update channel: ${updateChannel}`);
    autoUpdater.checkForUpdates();
    // } else {
    //   console.log("### Windows machine, do not check the update.");
    // }
  }
});

module.exports = { updater };
