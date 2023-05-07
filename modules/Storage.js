const { app, ipcMain } = require("electron");
const Store = require("electron-store");

class Storage {
  constructor() {
    this.store = new Store();
    this.configs = {
      get_ready_time_out_text: 3,
      get_ready_time_out_progress_bar: 3,
      top_speed_page_delay: 10,
      fun_facts_time_out: 6,
      disable_serial_for_dev: false,
    };
  }

  init() {
    const _this = this;
    // const data = _this.isObjectEmpty(_this.data_origin_store.store)
    // ? _this.origin_data
    // : _this.data_origin_store.store;

    ipcMain.on("get-configs", (e, msg) => {
      if (msg) e.returnValue = JSON.stringify(_this.store.get());
    });

    ipcMain.on("get-single-config", (e, config) => {
      if (config) {
        let result = _this.store.get(config);
        config == null ? (e.returnValue = false) : (e.returnValue = result);
      }
    });

    if (_this.isObjectEmpty(_this.store.store)) {
      _this.store.set(_this.configs);
    }

    console.log("### Storage class init at Main Process ###");
  }

  isObjectEmpty(obj) {
    return Object.keys(obj).length === 0;
  }
}

module.exports = Storage;
