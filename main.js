const { app, BrowserWindow, powerMonitor, ipcMain, nativeTheme, shell, autoUpdater } = require(`electron`);
const path = require(`path`);
const { readFileSync } = require(`fs`);
const Store = require('electron-store');
const Ajv = require('ajv');
const log = require('./js/logger');

const isDev = process.env.NODE_ENV === 'development';

const repoProps = {
  owner: `kashamalasha`,
  name: `nightscout-widget-electron`,
}

const server = 'https://update.electronjs.org';
const feed = `${server}/${repoProps.owner}/${repoProps.name}/${process.platform}-${process.arch}/${app.getVersion()}`;

autoUpdater.setFeedURL(feed);

if (!isDev) {
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 10 * 60 * 1000);
}

const SCHEMA = JSON.parse(readFileSync(path.join(__dirname, `js/config-schema.json`)));
const config = new Store();
const ajv = new Ajv();

const validate = ajv.compile(SCHEMA);
const configValid = validate(config.get());

if (!configValid) {
  const key = validate.errors[0].instancePath.substring(1).replaceAll(`/`, `.`);
  const value = config.get(key);
  const error = `Value ${value} of ${key} ${validate.errors[0].message}`;

  log.error(error);
  log.error(`Schema reference: `, validate.errors[0]);
}

const createWindow = () => {

  const defaultWidgetValues = {
    position: {
      x: 1000,
      y: 100
    },
    opacity: 100,
  }

  const widgetBounds = {
    width: 180,
    height: 80,
    x: configValid ? config.get(`WIDGET.POSITION.x`) : defaultWidgetValues.position.x,
    y: configValid ? config.get(`WIDGET.POSITION.y`) : defaultWidgetValues.position.y,
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
    backgroundColor: `rgba(96, 96, 96, ${defaultWidgetValues.opacity / 100})`,

  });

  const settingsBounds = {
    width: 800,
    height: 530,
  };

  const getPosition = () => {
    const widgetLastPosition = {
      x: configValid ? config.get(`WIDGET.POSITION.x`) : defaultWidgetValues.position.x,
      y: configValid ? config.get(`WIDGET.POSITION.y`) : defaultWidgetValues.position.y,
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

  ipcMain.on(`open-nightscout`, (evt) => {
    evt.preventDefault();

    const url = config.get(`NIGHTSCOUT.URL`);

    try {
      shell.openExternal(url);
      log.info(`Open site ${url} was triggered`);
    } catch (error) {
      log.error(`Requested site didn't open due to ${error}`);
    }

  });

  ipcMain.on(`show-settings`, (evt) => {
    evt.preventDefault();

    settingsWindow.setBounds(getPosition());
    settingsWindow.show();
  });

  ipcMain.on(`open-logfile`, () => {
    shell.openPath(app.getPath(`logs`));
  });

  settingsWindow.on(`close`, (evt) => {
    evt.preventDefault();
    settingsWindow.hide();
  });

  return { mainWindow, settingsWindow };

};

const singleInstance = app.requestSingleInstanceLock();
if (!singleInstance) app.quit();

app.whenReady().then(() => {
  app.dock.hide();

  const { session } = require(`electron`);

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [`script-src 'self'`]
      }
    });
  });

  const widget = createWindow();
  log.info(`App was started successfully`);

  app.on(`activate`, () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.on(`log-message`, (evt, msg, level) => {
    evt.preventDefault();

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

  ipcMain.on(`close-window`, (evt) => {
    if (evt.sender.getTitle() === `Nightscout Widget`) {
      app.exit();
      log.info(`App was closed due to close-window event`);
    } else {
      widget.settingsWindow.hide();
    }
  });

  ipcMain.on(`restart`, () => {
    app.relaunch();
    app.exit();
    log.info(`App was restarted due to renderer event`);
  });

  ipcMain.handle(`get-settings`, async () => {
    return config.get();
  })

  ipcMain.on(`set-settings`, (evt, data) => {
    evt.preventDefault();

    try {
      config.set(`NIGHTSCOUT.URL`, data[`nightscout-url`]);
      config.set(`NIGHTSCOUT.TOKEN`, data[`nightscout-token`]);
      config.set(`NIGHTSCOUT.INTERVAL`, parseInt(data[`nightscout-interval`], 10));
      config.set(`WIDGET.OPACITY`, 100);
      config.set(`WIDGET.AGE_LIMIT`, parseInt(data[`age-limit`], 10));
      config.set(`WIDGET.SHOW_AGE`, data[`show-age`]);
      config.set(`BG.HIGH`, parseFloat(data[`bg-high`]));
      config.set(`BG.LOW`, parseFloat(data[`bg-low`]));
      config.set(`BG.TARGET.TOP`, parseFloat(data[`bg-target-top`]));
      config.set(`BG.TARGET.BOTTOM`, parseFloat(data[`bg-target-bottom`]));

      log.info('Config was updated successfully');
    } catch (error) {
      log.error(error, data);
    }

  });

  ipcMain.on(`set-widget-opacity`, (_evt, opacity) => {
    widget.mainWindow.setBackgroundColor(`rgba(96, 96, 96, ${opacity / 100})`);
  });

  ipcMain.on(`test-age-visibility`, (_evt, show) => {
    widget.mainWindow.webContents.send('set-age-visibility', show);
  });
});

powerMonitor.on(`unlock-screen`, () => {
  if (app.isHidden()) {
    app.show();
    log.info(`App is shown after unlock-screen event`)
  } else if (!app.isHidden()) {
    log.silly(`Duplicated powerMonitor event handler called by 'unlock-screen' event`);
  }
});

powerMonitor.on(`resume`, () => {
  if (app.isHidden()) {
    app.show();
    log.info(`App is shown after resume event`)
  } else if (!app.isHidden()) {
    log.silly(`Duplicated powerMonitor event handler called by 'resume' event`);
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
  } else if (!app.isHidden()) {
    log.silly(`Duplicated nativeTheme event handler called by 'updated' event`);
  } else {
    app.relaunch();
    app.exit();
    log.info(`App was restarted due to theme change`);
  }
});

app.on(`window-all-closed`, () => {
  if (process.platform !== `darwin`) app.quit();
});
