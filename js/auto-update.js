const { autoUpdater } = require(`electron-updater`);
const { Store } = require(`electron-store`);
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
  autoUpdater.checkForUpdatesAndNotify();
};

module.exports = requestToUpdate;
