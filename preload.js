const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("dialog", {
  show: async (message) => {
    const result = await ipcRenderer.invoke("show-dialog", message);
    console.log(result);
    return 1;
  },

  abort: (message) => {
    const result = ipcRenderer.send("abort-dialog", message);
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
