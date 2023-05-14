const log = require('electron-log');
const process = require('process');

const isDev = process.env.NODE_ENV === 'development';

// electron-log
//
// By default it writes logs to the following locations:
//
// on Linux: ~/.config/<app name>/log.log
// on OS X: ~/Library/Logs/<app name>/log.log
// on Windows: %USERPROFILE%\AppData\Roaming\<app name>\log.log
log.transports.file.level = isDev ? 'silly' : 'warn';
log.transports.console.level = isDev ? 'debug' : 'warn';

module.exports = log;
