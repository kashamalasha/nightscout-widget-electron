const { app, BrowserWindow, powerMonitor, ipcMain, nativeTheme, shell, dialog } = require(`electron`);
const path = require(`path`);
const { readFileSync } = require(`fs`);
const { exec } = require(`child_process`);
const Store = require(`electron-store`);
const Ajv = require(`ajv`);
const log = require(`./js/logger`);
const requestToUpdate = require(`./js/auto-update`);
const isDev = process.env.NODE_ENV === `development`;
const isMac = process.platform == `darwin`;
const isLinux = process.platform == `linux`;

const SCHEMA = JSON.parse(readFileSync(path.join(__dirname, `js/config-schema.json`)));
const config = new Store();
const ajv = new Ajv();

if (config.size === 0) {
  try {
    config.clear();
    log.warn(`Config created successfully`);
  } catch (error) {
    const errorMessage =`Failed to create config: ${error}`;
    dialog.showMessageBox({
      type: `error`,
      title: `Config wan't created`,
      message: errorMessage,
      buttons: [`OK`],
      defaultId: 0,
      icon: `error`
    });
    log.error(errorMessage);
  }
}

const validate = ajv.compile(SCHEMA);
const configValid = validate(config.get());

if (!configValid && config.size > 0) {
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

  if (!configValid) {
    config.set(`WIDGET.POSITION`, defaultWidgetValues.position);
  }

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
      preload: path.join(__dirname, `js/preload.js`)
    },
    alwaysOnTop: true,
    frame: false,
    skipTaskbar: true,
    transparent: true,
  });

  const settingsBounds = {
    width: 800,
    height: 530,
  };

  const getPosition = () => {
    const widgetLastPosition = config.get(`WIDGET.POSITION`);

    x = widgetLastPosition.x - settingsBounds.width;
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
    transparent: true,
    show: configValid ? false : true,
    parent: mainWindow,
    frame: false,
  });

  mainWindow.loadFile(`widget.html`);
  settingsWindow.loadFile('settings.html');

  mainWindow.on(`move`, () => {
    const { x, y } = mainWindow.getBounds();
    config.set(`WIDGET.POSITION`, { x, y });
    const childPosition = getPosition();
    settingsWindow.setPosition(childPosition.x, childPosition.y, false);
  });

  mainWindow.webContents.on(`ready-to-show`, () => {
    if (isLinux) {
     exec(`wmctrl -m`, (error, stdout, stderr) => {
      if (error) {
        log.error(`wmctrl is not installed on your system. Please install it.`);
        const errorMessage = `Please install wmctrl using "sudo apt-get install wmctrl"`;
        dialog.showMessageBox({
          type: `error`,
          title: `wmctrl not found`,
          message: errorMessage,
          buttons: [`OK`],
          defaultId: 0,
          icon: `error`
        });
      } else {
        exec(`wmctrl -r "${mainWindow.getTitle()}" -b add,skip_taskbar`, (error, stdout, stderr) => {
          if (error) {
            console.error(`Failed to execute wmctrl: ${error.message}`);
          }
        });
      }
    });
    }
  });

  if (isLinux) {
    
    const linuxDependencies = ['wmctrl', 'xdg-utils'];

    const checkDependencies = (() => {
      let missingCounter = 0;
      const missingDependencies = [];
    
      linuxDependencies.forEach((dependency) => {
        exec(`which ${dependency}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`${dependency} is not installed on your system.`);
            missingCounter++; // Increment the missing counter
            missingDependencies.push(dependency); // Add missing dependency to the array
          } else {
            console.log(`${dependency} is installed.`);
          }
    
          if (missingCounter === linuxDependencies.length) {
            if (missingDependencies.length > 0) {
              const errorMessage = `Please install the following dependencies:\n${missingDependencies.join('\n')}`;
              dialog.showMessageBox({
                type: 'error',
                title: 'Missing Dependencies',
                message: errorMessage,
                buttons: ['OK'],
                defaultId: 0,
                icon: 'error'
              });
            }
          }
        });
      });
    });

    mainWindow.webContents.on(`ready-to-show`, () => {
      checkDependencies();
      exec(`wmctrl -r "${mainWindow.getTitle()}" -b add, skip_taskbar`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Failed to execute wmctrl: ${error.message}`);
        }
      });
    });
  }

  mainWindow.webContents.on(`did-finish-load`, () => {
    requestToUpdate();
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
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
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
    return result.response
  });

  ipcMain.handle(`show-message-box-sync`, async (evt, options) => {
    const result = await dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow(), options);
    return result.response
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
    app.relaunch();
    app.exit();
    log.info(`App was restarted due to renderer event`);
  });

  ipcMain.handle(`get-settings`, async () => {
    return config.get();
  });

  ipcMain.handle(`get-version`, async () => {
    return app.getVersion();
  });

  ipcMain.on(`set-settings`, (evt, data) => {
    evt.preventDefault();

    try {
      const { x, y } = widget.mainWindow.getBounds();
      config.set(`WIDGET.POSITION`, { x, y });

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

if (isMac) {
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
}

app.on(`window-all-closed`, () => {
  if (!isMac) app.quit();
});
