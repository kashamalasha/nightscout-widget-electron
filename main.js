const { app, BrowserWindow, powerMonitor, ipcMain, nativeTheme, shell, dialog } = require(`electron`);
const path = require(`path`);
const { readFileSync, readFile } = require(`fs`);
const { promisify } = require(`util`);

const readFileAsync = promisify(readFile);
const { spawn } = require(`child_process`);
const Store = require(`electron-store`).default;
const Ajv = require(`ajv`);
const log = require(`./js/logger`);
const requestToUpdate = require(`./js/auto-update`);

const isDev = process.env.NODE_ENV === `development`;
const isMac = process.platform == `darwin`;
const isLinux = process.platform == `linux`;

const SCHEMA = JSON.parse(readFileSync(path.join(__dirname, `js/config-schema.json`)));
const defaults = JSON.parse(readFileSync(path.join(__dirname, `js/config-default.json`)));

const config = new Store({ defaults });

if (config.has(`JWT_EXPIRATION`)) {
  config.delete(`JWT_EXPIRATION`);
}

const ajv = new Ajv();

const alert = (type, title, message, parentWindow = null) => {
  const options = {
    type,
    title,
    message,
    buttons: [`OK`],
    defaultId: 0,
    icon: `asset/icons/png/128x128.png`,
  };

  dialog.showMessageBox(parentWindow, options);
};


const isFirstRun = () => {
  const isFirstRun = config.get(`IS_FIRST_RUN`);
  if (isFirstRun) {
    config.set(`IS_FIRST_RUN`, false);
  }
  return isFirstRun;
};

if (config.size === 0) {
  try {
    config.clear();
    log.warn(`Config created successfully`);
  } catch (error) {
    const errorMessage =`Failed to create config: ${error}`;
    alert(`error`, `Config wasn't created`, errorMessage);
    log.error(errorMessage);
  }
}

const validate = ajv.compile(SCHEMA);
const configValid = validate(config.get());


const createWindow = () => {

  const widgetBounds = {
    width: 180,
    height: 80,
    x: config.get(`WIDGET.POSITION.x`),
    y: config.get(`WIDGET.POSITION.y`),
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
      preload: path.join(__dirname, `js/preload.js`),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      enableRemoteModule: false
    },
    alwaysOnTop: true,
    frame: false,
    skipTaskbar: true,
    transparent: true,
    resizable: false,
  });

  const settingsBounds = {
    width: 800,
    height: 530,
  };

  const getPosition = () => {
    const widgetLastPosition = config.get(`WIDGET.POSITION`);

    const x = widgetLastPosition.x - settingsBounds.width;
    const y = widgetLastPosition.y;

    return { x, y };
  };

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
      preload: path.join(__dirname, `js/preload.js`),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      enableRemoteModule: false
    },
    transparent: true,
    show: configValid ? false : true,
    parent: mainWindow,
    frame: false,
    resizable: false,
  });

  mainWindow.loadFile(`widget.html`);
  settingsWindow.loadFile(`settings.html`);

  settingsWindow.webContents.once(`ready-to-show`, () => {
    ipcMain.on(`check-validation`, () => {
      if (!configValid && validate.errors && validate.errors.length > 0) {
        const errorPath = validate.errors[0].instancePath.substring(1).replaceAll(`/`, `.`);
        const errorReason = validate.errors[0].message;
        const errorMessage = `Config invalid on: ${errorPath}\nReason: ${errorReason}`;

        log.error(errorMessage.replaceAll(`\n`, ` `));
        log.error(`Schema reference: `, validate.errors[0]);

        if (!isFirstRun()) {
          alert(`error`, `Config invalid`, errorMessage, settingsWindow);
        }
      }
    });
  });

  mainWindow.on(`move`, () => {
    const { x, y } = mainWindow.getBounds();
    config.set(`WIDGET.POSITION`, { x, y });
    const childPosition = getPosition();
    settingsWindow.setPosition(childPosition.x, childPosition.y, false);
  });

  if (isLinux) {
    const linuxDependencies = {
      "wmctrl": `wmctrl`,
      "xdg-utils": `xdg-open`,
    };

    const checkDependencies = (() => {
      let missingCounter = 0;
      const missingDependencies = [];

      Object.entries(linuxDependencies).forEach(([package, command]) => {
        // Use spawn with proper argument handling instead of exec for security
        const whichProcess = spawn(`which`, [command]);
        
        whichProcess.on(`close`, (code) => {
          if (code !== 0) {
            log.error(`${package} is not installed on your system.`);
            missingDependencies.push(package);
          } else {
            log.info(`${package} is installed.`);
          }

          missingCounter++;

          if (missingCounter === Object.keys(linuxDependencies).length) {
            if (missingDependencies.length > 0) {
              const errorMessage = `Please install the following dependencies:\n - ${missingDependencies.join(`\n - `)}`;
              alert(`error`, `Missing dependencies`, errorMessage);
            }
          }
        });
      });
    });

    mainWindow.webContents.on(`ready-to-show`, () => {
      checkDependencies();
      // Use spawn with proper argument handling instead of exec for security
      const title = mainWindow.getTitle();
      const wmctrlProcess = spawn(`wmctrl`, [`-r`, title, `-b`, `add,skip_taskbar`]);
      
      wmctrlProcess.on(`error`, (error) => {
        log.error(`Failed to execute wmctrl: ${error.message}`);
      });
    });
  }

  mainWindow.webContents.on(`did-finish-load`, () => {
    requestToUpdate();
  });

  ipcMain.on(`open-site`, (evt, siteName) => {
    evt.preventDefault();
    let url = ``;

    switch (siteName) {
    case `nightscout`:
      url = config.get(`NIGHTSCOUT.URL`);
      break;
    case `poeditor`:
      url = `https://poeditor.com/join/project/PzcEMSOFc7`;
      break;
    default:
      break;
    }

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
if (!singleInstance) {
  app.quit();
}

app.whenReady().then(() => {
  if (!isDev && isMac) {
    app.dock.hide();
  }


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
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  ipcMain.on(`log-message`, (evt, msg, level) => {
    evt.preventDefault();

    const prefix = `Renderer:`;
    switch (level) {
    case `info`:
      log.info(`${prefix} ${msg}`);
      break;
    case `warn`:
      log.warn(`${prefix} ${msg}`, `color: orange`);
      break;
    case `error`:
      log.error(`${prefix} ${msg}`, `color: red`);
      break;
    }
  });

  ipcMain.handle(`show-message-box`, async (evt, options) => {
    const result = await dialog.showMessageBox(BrowserWindow.getFocusedWindow(), options);
    return result.response;
  });

  ipcMain.handle(`show-message-box-sync`, async (evt, options) => {
    const result = await dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow(), options);
    return result.response;
  });

  ipcMain.on(`close-window`, (evt) => {
    if (evt.sender.getTitle() === `Owlet`) {
      app.exit();
      log.info(`App was closed due to close-window event`);
    } else {
      widget.settingsWindow.hide();
    }
  });

  ipcMain.on(`restart`, () => {
    const args = process.argv.slice(1);
    const options = { args };
    if (process.env.APPIMAGE) {
      options.execPath = process.env.APPIMAGE;
      options.args.unshift(`--appimage-extract-and-run`);
    }
    app.relaunch(options);
    app.exit();
    log.info(`App was restarted due to renderer event`);
  });

  ipcMain.handle(`get-settings`, async () => {
    return config.get();
  });

  ipcMain.handle(`get-version`, async () => {
    return app.getVersion();
  });

  ipcMain.handle(`get-language`, async () => {

    const configLanguage = config.get(`LANGUAGE`);

    if (configLanguage) {
      return configLanguage;
    }

    const systemLanguages = app.getPreferredSystemLanguages();
    let systemLanguage = systemLanguages[0];

    const countryCodeRegex = /^[a-z]{2}-[A-Z]{2}$/;
    if (countryCodeRegex.test(systemLanguage)) {
      systemLanguage = systemLanguage.split(`-`)[0];
    }

    return systemLanguage;
  });

  ipcMain.on(`set-language`, (evt, language) => {
    evt.preventDefault();

    try {
      config.set(`LANGUAGE`, language);
    } catch (error) {
      log.error(error, language);
    }
  });

  ipcMain.handle(`get-translate`, async (evt, language) => {
    try {
      const data = await readFileAsync(path.join(__dirname, `localization/locales/${language}.json`));
      const translation = JSON.parse(data);
      return translation;
    } catch (err) {
      log.error(`Failed to load translation for language ${language}:`, err);
      
      // Fallback to English if translation file not found
      if (err.code === `ENOENT` && language !== `en`) {
        try {
          const fallbackData = await readFileAsync(path.join(__dirname, `localization/locales/en.json`));
          const fallbackTranslation = JSON.parse(fallbackData);
          log.info(`Fallback to English translation for language ${language}`);
          return fallbackTranslation;
        } catch (fallbackErr) {
          log.error(`Failed to load fallback English translation:`, fallbackErr);
          // Return empty object to prevent app crash
          return {};
        }
      }
      
      // Return empty object for other errors to prevent app crash
      return {};
    }
  });

  ipcMain.on(`set-settings`, (evt, data) => {
    evt.preventDefault();

    try {
      const { x, y } = widget.mainWindow.getBounds();
      config.set(`WIDGET.POSITION`, { x, y });

      config.set(`NIGHTSCOUT.URL`, data[`nightscout-url`]);
      config.set(`NIGHTSCOUT.TOKEN`, data[`nightscout-token`]);
      config.set(`NIGHTSCOUT.INTERVAL`, parseInt(data[`nightscout-interval`], 10));
      config.set(`WIDGET.AGE_LIMIT`, parseInt(data[`age-limit`], 10));
      config.set(`WIDGET.SHOW_AGE`, data[`show-age`]);
      config.set(`WIDGET.UNITS_IN_MMOL`, data[`units-in-mmol`]);
      config.set(`WIDGET.CALC_TREND`, data[`calc-trend`]);
      config.set(`BG.HIGH`, parseFloat(data[`bg-high`]));
      config.set(`BG.LOW`, parseFloat(data[`bg-low`]));
      config.set(`BG.TARGET.TOP`, parseFloat(data[`bg-target-top`]));
      config.set(`BG.TARGET.BOTTOM`, parseFloat(data[`bg-target-bottom`]));

      log.info(`Config was updated successfully`);
    } catch (error) {
      log.error(error, data);
    }

  });

  ipcMain.on(`test-age-visibility`, (_evt, show) => {
    widget.mainWindow.webContents.send(`set-age-visibility`, show);
  });

  ipcMain.on(`test-units`, (_evt, isMMOL) => {
    config.set(`WIDGET.UNITS_IN_MMOL`, isMMOL);
    widget.mainWindow.webContents.send(`set-units`, isMMOL);
    widget.settingsWindow.webContents.send(`set-units`, isMMOL);
  });

  ipcMain.on(`test-calc-trend`, (_evt, calcTrend, isMMOL) => {
    config.set(`WIDGET.CALC_TREND`, calcTrend);
    widget.mainWindow.webContents.send(`set-calc-trend`, calcTrend, isMMOL);
  });

});

if (isMac) {
  powerMonitor.on(`unlock-screen`, () => {
    if (app.isHidden()) {
      app.show();
      log.info(`App is shown after unlock-screen event`);
    } else if (!app.isHidden()) {
      log.silly(`Duplicated powerMonitor event handler called by 'unlock-screen' event`);
    }
  });

  powerMonitor.on(`resume`, () => {
    if (app.isHidden()) {
      app.show();
      log.info(`App is shown after resume event`);
    } else if (!app.isHidden()) {
      log.silly(`Duplicated powerMonitor event handler called by 'resume' event`);
    } else {
      app.relaunch();
      app.exit();
      log.info(`App was restarted after resume from sleep`);
    }
  });

  nativeTheme.on(`updated`, () => {
    if (app.isHidden()) {
      app.show();
      log.info(`App is shown after theme change event`);
    } else if (!app.isHidden()) {
      log.silly(`Duplicated nativeTheme event handler called by 'updated' event`);
    } else {
      app.relaunch();
      app.exit();
      log.info(`App was restarted due to theme change`);
    }
  });
}

app.on(`window-all-closed`, () => {
  app.quit();
});
