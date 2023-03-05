const { app } = require("electron");
// Home Directory
const homedir = require("os").homedir();
const appDir = app.getPath("documents") + "/Electron Boilerplate 2023/";

/**
// Keep a reference for dev mode
let dev = false;
if (
  process.env.NODE_ENV !== undefined &&
  process.env.NODE_ENV === "development"
) {
  dev = true;
}
 */

const platform = process.platform;

module.exports = { homedir, appDir, platform };
