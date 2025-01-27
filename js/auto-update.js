const { autoUpdater } = require(`electron-updater`);
const { ProgressBar } = require(`electron-progressbar`);
const { dialog } = require(`electron`);
const Store = require(`electron-store`);
const log = require(`./logger`);

const config = new Store();

autoUpdater.logger = log;

const hasUpdateRequestForToday = () => {
  const today = new Date().toLocaleDateString();

  if (config.get(`LAST_UPDATE_REQUEST`) === today) {
    return true;
  }

  config.set(`LAST_UPDATE_REQUEST`, today);
  return false;
};

const requestToUpdate = () => {
  if (hasUpdateRequestForToday()) {
    log.info(`Update was already requested for today`);
    return;
  }
  // autoUpdater.checkForUpdatesAndNotify();
  autoUpdater.checkForUpdates();
  autoUpdater.on(`update-available`, () => {
    const response = dialog.showOpenDialogSync({
      // TODO: implement the dialog for updates
    });
  });
  autoUpdater.on(`download-progress`, (progress) => {
    const progressBar = new ProgressBar({
      text: `Downloading update...`,
      detail: `Downloading ${progress.percent.toFixed(2)}%`,
      icon: `asset/icons/png/128x128.png`
    });

    progressBar
      .on('completed', () => {
        console.info(`completed...`);
        progressBar.detail = 'Task completed. Exiting...';
      })
      .on('aborted', (value) => {
        console.info(`aborted... ${value}`);
      })
      .on('progress', (value) => {
        progressBar.detail = `Value ${value} out of ${progressBar.getOptions().maxValue}...`;
      });
  });
};

module.exports = requestToUpdate;
