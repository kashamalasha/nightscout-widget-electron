const { contextBridge, ipcRenderer } = require(`electron/renderer`);

contextBridge.exposeInMainWorld(`electronAPI`, {
  closeWindow: () => ipcRenderer.send(`close-window`),
  showSettings: () => ipcRenderer.send(`show-settings`),
  getVersion: () => ipcRenderer.invoke(`get-version`),
  getSettings: () => ipcRenderer.invoke(`get-settings`),
  setSettings: (data) => ipcRenderer.send(`set-settings`, data),
  testAgeVisisblity: (show) => ipcRenderer.send(`test-age-visibility`, show),
  setAgeVisibility: (show) => ipcRenderer.on(`set-age-visibility`, show),
  openSite: (siteName) => ipcRenderer.send(`open-site`, siteName),
  openLogFile: () => ipcRenderer.send(`open-logfile`),
  restart: () => ipcRenderer.send(`restart`),
  logger : {
    info: (msg) => ipcRenderer.send(`log-message`, msg, `info`),
    warn: (msg) => ipcRenderer.send(`log-message`, msg, `warn`),
    error: (msg) => ipcRenderer.send(`log-message`, msg, `error`),
  },
  dialog: {
    showMessageBox: (options) => ipcRenderer.invoke(`show-message-box`, options),
    showMessageBoxSync: (options) => ipcRenderer.invoke(`show-message-box-sync`, options),
  },
  checkFormValidation: () => ipcRenderer.send(`check-validation`),
  getTranslate: (language) => ipcRenderer.invoke(`get-translate`, language),
  getLanguage: () => ipcRenderer.invoke(`get-language`),
  setLanguage: (language) => ipcRenderer.send(`set-language`, language),
  testUnits: (isMMOL) => ipcRenderer.send(`test-units`, isMMOL),
  setUnits: (isMMOL) => ipcRenderer.on(`set-units`, isMMOL),
  testCalcTrend: (calcTrend, isMMOL) => ipcRenderer.send(`test-calc-trend`, calcTrend, isMMOL),
  setCalcTrend: (calcTrend, isMMOL) => ipcRenderer.on(`set-calc-trend`, calcTrend, isMMOL),
});
