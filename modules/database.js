const { ipcMain } = require("electron");
const mongoose = require("mongoose");
const { mainLog } = require("./logger");
const { ScoreBoard } = require("../schema/scoreBoardSchema");

let dbConnected = false;
async function main() {
  await mongoose.connect("mongodb://localhost:27017/nerf-gun-game");

  mainLog.info("Connected to DATA BASE!");
  dbConnected = 1;
}

const findData = async () => {
  if (dbConnected == 1) {
    let data = await ScoreBoard.find({});
    return data;
  } else {
    console.error("### Databse error!");
    return null;
  }
};

/**
 * IPC
 */
/** Check database */
ipcMain.on("isDatabaseConnected", (e, msg) => {
  if (msg) e.returnValue = dbConnected;
});

/** Save data */
ipcMain.handle("save-data", async (e, data) => {
  if (dbConnected == 1) {
    const record = new ScoreBoard({
      name: data.name,
      score: data.score,
      created: new Date().toLocaleString(),
    });
    await record.save();
    mainLog.info("Data saved.");
    return true;
  } else {
    mainLog.error("### Databse error!");
    return false;
  }
});

/** Find data */
ipcMain.handle("find-data", async (e) => {
  // await findData();
  if (dbConnected == 1) {
    let data = await ScoreBoard.find({});
    return JSON.stringify(data);
  } else {
    mainLog.error("### Databse error!");
    return null;
  }
});

module.exports = { main, findData };
