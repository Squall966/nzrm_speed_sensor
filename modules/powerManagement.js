const { ipcMain, app } = require("electron");
const shutdown = require("electron-shutdown-command");
const { powerScope } = require("./logger");

const rebootUnit = () => {
  powerScope.info("Unit Reboot now.");
  app.quit(); // quit the app
  shutdown.reboot(); // reboot the machine and hopefully the app will update
};

const rebootApp = () => {
  powerScope.info("App Reboot now.");
  app.relaunch();
  app.exit();
};

ipcMain.on("reboot-app", (e, msg) => {
  console.log("Reboot app");
  if (msg) rebootApp();
});

// const ipcFns = () => {
//   ipcMain.on("reboot-app", (e, msg) => {
//     console.log("Reboot app");
//     if (msg) rebootApp();
//   });
// };

module.exports = { rebootUnit, rebootApp };
