global.settings = require("./config/AppSettings")
global.messages = require("./common/Messages")
global.path = require("path")

const { startServer } = require('./bin/server');
global.appBasePath = process.cwd();

const logger = require('./common/Logger').Log;
global.log = logger;
startServer();

