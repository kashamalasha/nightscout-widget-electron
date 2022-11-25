const {app, BrowserWindow} = require(`electron`);
const path = require(`path`);

const { readFileSync } = require(`fs`);
const CONFIG = JSON.parse(readFileSync(`./js/config.json`));


const createWindow = () => {
  const electron = require(`electron`);
  const screenElectron = electron.screen;
  const mainScreen = screenElectron.getPrimaryDisplay();

  const window = {
    width: 180,
    height: 80,
  };

  const mainWindow = new BrowserWindow({
    width: window.width,
    height: window.height,
    minWidth: window.width,
    minHeight: window.height,
    maxWidth: window.width,
    maxHeight: window.height,
    y: 0,
    x: mainScreen.size.width - window.width,
    webPreferences: {
      preload: path.join(__dirname, `preload.js`)
    },
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    backgroundColor: `rgba(96, 96, 96, ${CONFIG.WIDGET.OPACITY})`,
  });

  mainWindow.loadFile(`index.html`);
  // mainWindow.webContents.toggleDevTools();

};

app.whenReady().then(() => {
  const { session } = require(`electron`);

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [`default-src 'self' ${CONFIG.NIGHTSCOUT.URL} `]
      }
    });
  });

  createWindow();

  app.on(`activate`, () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

});

app.on(`window-all-closed`, () => {
  if (process.platform !== `darwin`) app.quit();
});
