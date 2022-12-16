const { contextBridge, ipcRenderer } = require(`electron`);

contextBridge.exposeInMainWorld(`electronAPI`, {
  closeWindow: () => ipcRenderer.send(`close-window`),
  showSettings: () => ipcRenderer.send(`show-settings`),
  getSettings: () => ipcRenderer.invoke(`get-settings`),
  setSettings: (data) => ipcRenderer.send(`set-settings`, data),
  setWidgetOpacity: (opacity) => ipcRenderer.send(`set-widget-opacity`, opacity),
  logger : {
    info: (msg) => ipcRenderer.send(`log-message`, msg, `info`),
    warn: (msg) => ipcRenderer.send(`log-message`, msg, `warn`),
    error: (msg) => ipcRenderer.send(`log-message`, msg, `error`),
  },
});
