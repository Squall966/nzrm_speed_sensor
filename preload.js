const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("dialog", {
  show: async (message) => {
    const result = await ipcRenderer.invoke("show-dialog", message);
    return result;
  },

  abort: (message) => {
    const result = ipcRenderer.send("abort-dialog", message);
  },
});

contextBridge.exposeInMainWorld("nzrm", {
  topSpeed: (msg) => {
    if (msg) {
      ipcRenderer.send("top_speed", msg);
      // console.log("### Context Bridge NZRM Top Speed ", msg);
    }
  },

  listen: (eventName, callback) => {
    ipcRenderer.on(eventName, callback);
  },
});

/**
// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
 */
