const log = require(`electron-log`);
const process = require(`process`);

const isDev = process.env.NODE_ENV === `development`;

log.transports.file.level = isDev ? `silly` : `warn`;
log.transports.console.level = isDev ? `debug` : `warn`;

module.exports = log;
