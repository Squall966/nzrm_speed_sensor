const { ipcMain } = require("electron");
const path = require("path");
const log = require("electron-log");
const { appDir } = require("../helpers/generalVariables");

// const date = new Date().toLocaleDateString().replaceAll("/", "-");
let date, appDirectory;

const mainLog = log.create("mainLog");
// const adminLog = log.create("adminLog");
const updateLog = log.create("updateLog");
const appLog = log.create("appLog");
// const downloaderLog = log.create("downloaderLog");

const powerScope = mainLog.scope("Power");

const currentDate = () => {
  /**
   * Define the date for the logger
   */
  date = new Date().toLocaleDateString().replaceAll("/", "-");
  return date;
};

const defineLogPath = (logInstance, logName) => {
  // Define log path
  // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>");
  // console.log(`DEFINE LOG PATH: logs/logs@${date}/${logName}.log`);
  // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>");
  try {
    logInstance.transports.file.resolvePath = () =>
      path.join(appDirectory, `logs/logs@${date}/${logName}.log`);
  } catch (error) {
    mainLog.error("Can'f define log path", error);
  }
};

const logsPath = () => {
  mainLog.info("Defining log paths...");
  defineLogPath(mainLog, "main");
  // defineLogPath(adminLog, "admin");
  defineLogPath(updateLog, "update");
  defineLogPath(appLog, "app");
  // defineLogPath(downloaderLog, "downloader");
};

const logger = (appDirectoryLogger) => {
  appDirectory = appDir;

  mainLog.info("#####################################################");
  mainLog.info("############### APP STARTED, Welcome ################");
  mainLog.info("#####################################################");
  mainLog.info(`Hi, today is ${date}. Have a nice day!`);
};

const ipcLog = () => {
  ipcMain.on("logger", (event, message, logType, isAdmin = null) => {
    // Log from Renderer process, define wheather it's from app or admin
    let log = isAdmin ? adminLog : appLog;
    switch (logType) {
      case 1:
        // debug
        log.debug(message);
        break;
      case 2:
        // warn
        log.warn(message);
        break;
      case 3:
        // error
        log.error(message);
        break;
      default:
        // info
        log.info(message);
        break;
    }
  });
};

// date = currentDate();

currentDate();
logsPath();
ipcLog();

ipcMain.on("timenow", (msg) => {
  if (msg) {
    dateNow = msg.toLocaleDateString().replaceAll("/", "-");
    if (dateNow !== date) {
      mainLog.info(
        `Date checked: ${date} >>> The date changes, update the logs path.`
      );
      logsPath();
      // console.log("the date does not change");
      // return false;
    }
  }
});

module.exports = {
  logger,
  mainLog,
  updateLog,
  powerScope,
};
