const {app, BrowserWindow, powerMonitor, ipcMain, nativeTheme} = require(`electron`);
const path = require(`path`);
const { readFileSync } = require(`fs`);
const Store = require('electron-store');
const Ajv = require('ajv');
const log = require('./logger');

const SCHEMA = JSON.parse(readFileSync(`./js/config-schema.json`));
const config = new Store();
const ajv = new Ajv();

const validate = ajv.compile(SCHEMA);
const configValid = validate(config.get());

const createWindow = () => {

  const widgetBounds = {
    width: 180,
    height: 80,
    x: configValid ? config.get(`WIDGET.POSITION.x`) : 1000,
    y: configValid ? config.get(`WIDGET.POSITION.y`) : 100,
  };

  const mainWindow = new BrowserWindow({
    width: widgetBounds.width,
    height: widgetBounds.height,
    minWidth: widgetBounds.width,
    minHeight: widgetBounds.height,
    maxWidth: widgetBounds.width,
    maxHeight: widgetBounds.height,
    x: widgetBounds.x,
    y: widgetBounds.y,
    webPreferences: {
      preload: path.join(__dirname, `js/preload.js`)
    },
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    backgroundColor: `rgba(96, 96, 96, ${configValid ? config.get(`WIDGET.OPACITY`) : 0.3})`,
  });

  const settingsBounds = {
    width: 800,
    height: 530,
  };

  const getPosition = () => {
    const widgetLastPosition = {
      x: configValid ? config.get(`WIDGET.POSITION.x`) : 1000,
      y: configValid ? config.get(`WIDGET.POSITION.y`) : 100,
    };

    x = widgetLastPosition.x - (settingsBounds.width - widgetBounds.width);
    y = widgetLastPosition.y;

    return { x, y }
  }

  const settingsWindow = new BrowserWindow({
    width: settingsBounds.width,
    height: settingsBounds.height,
    minWidth: settingsBounds.width,
    minHeight: settingsBounds.height,
    maxWidth: settingsBounds.width,
    maxHeight: settingsBounds.height,
    x: getPosition().x,
    y: getPosition().y,
    webPreferences: {
      preload: path.join(__dirname, `js/preload.js`)
    },
    backgroundColor: `rgb(44, 51, 51)`,
    titleBarStyle: `hidden`,
    show: configValid ? false : true,
    parent: mainWindow,
  });

  mainWindow.loadFile(`widget.html`);
  settingsWindow.loadFile('settings.html');

  mainWindow.on(`moved`, () => {
    const { x, y } = mainWindow.getBounds();
    config.set(`WIDGET.POSITION`, { x, y })
  });

  ipcMain.on(`show-settings`, (event) => {
    event.preventDefault();

    settingsWindow.setBounds(getPosition());
    settingsWindow.show();
  });

  settingsWindow.on(`close`, (event) => {
    event.preventDefault();
    settingsWindow.hide();
  });

  if (!configValid) {
    const key = validate.errors[0].instancePath.substring(1).replaceAll(`/`, `.`);
    const value = config.get(key);
    const error = `${value} of ${key} ${validate.errors[0].message}`;

    log.error(error, validate.errors[0]);
  }

  return { mainWindow, settingsWindow };

};

app.whenReady().then(() => {
  const { session } = require(`electron`);

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [`script-src 'self'`]
      }
    });
  });

  const widget = createWindow()
  log.info(`App was started`);

  app.on(`activate`, () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.on(`log-message`, (event, msg, level) => {
    event.preventDefault();

    const prefix = `%cRenderer:`;
    switch (level) {
      case `info`:
        log.info(`${prefix} ${msg}`, `color: black`);
        break;
      case `warn`:
        log.warn(`${prefix} ${msg}`, `color: blue`);
        break;
      case `error`:
        log.error(`${prefix} ${msg}`, `color: red`);
        break;
    }
  });

  ipcMain.on(`close-window`, (event) => {
    if (event.sender.getTitle() === `Nightscout Widget`) {
      app.exit();
      log.info(`App was closed due to close-window event`);
    } else {
      widget.settingsWindow.hide();
      app.relaunch();
      app.exit();
      log.info(`App was restarted due to settings change event`);
    }
  });

  ipcMain.handle(`get-settings`, async () => {
    return config.get();
  })

  ipcMain.on(`set-settings`, (event, data) => {
    event.preventDefault();

    try {
      config.set(`NIGHTSCOUT.URL`, data[`nightscout-url`]);
      config.set(`NIGHTSCOUT.TOKEN`, data[`nightscout-token`]);
      config.set(`NIGHTSCOUT.INTERVAL`, parseInt(data[`nightscout-interval`], 10));
      config.set(`WIDGET.OPACITY`, parseFloat(data[`widget-opacity`]));
      config.set(`BG.HIGH`, parseFloat(data[`bg-high`]));
      config.set(`BG.LOW`, parseFloat(data[`bg-low`]));
      config.set(`BG.TARGET.TOP`, parseFloat(data[`bg-target-top`]));
      config.set(`BG.TARGET.BOTTOM`, parseFloat(data[`bg-target-bottom`]));

      log.info('Config was updated successfully');
    } catch (error) {
      log.error(error, data);
    }

  });

  ipcMain.on(`set-widget-opacity`, (event, opacity) => {
    widget.mainWindow.setBackgroundColor(`rgba(96, 96, 96, ${opacity})`);
  });
});

powerMonitor.on(`lock-screen`, () => {
  try {
    app.hide();
    log.info(`App was hidden due to lock-screen event`);
  } catch (err) {
    log.error(err);
  }
});

powerMonitor.on(`unlock-screen`, () => {
  if (app.isHidden()) app.show();
  log.info(`App is shown after unlock-screen event`)
});

powerMonitor.on(`resume`, () => {
  if (app.isHidden()) {
    app.show();
    log.info(`App is shown after resume event`)
  } else {
    app.relaunch();
    app.exit();
    log.info(`App was restarted after resume from sleep`);
  }
});

nativeTheme.on('updated', () => {
  if (app.isHidden()) {
    app.show();
    log.info(`App is shown after theme change event`)
  } else {
    app.relaunch();
    app.exit();
    log.info(`App was restarted due to theme change`);
  }
});

app.on(`window-all-closed`, () => {
  if (process.platform !== `darwin`) app.quit();
});
