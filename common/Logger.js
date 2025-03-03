const path = require("path");
const winston = require("winston");
require("winston-daily-rotate-file");
const logFileName = "Directory-Monitoring";
const logFileExtension = ".log";
const logDirectory = global.path.resolve(global.appBasePath, "logs");
const dateFormat = "YYYY-MM-DD";
const logType = "Analysis";
const threadName = "";
const threadNumber = 1;
const increment_value = 1;
let filteredStack;
let loggerFileName = "";
let loggerFunctionName = "";
let loggerLineNumber = "";
 
//Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format : "YYYY-MM-DD HH:mm:ss.SSS"
  }),
  winston.format.printf(
    (info) =>
      `${
        info.timestamp
      },${info.level.toUpperCase()},${loggerFileName},${loggerFunctionName},${loggerLineNumber},${
        info.message
      }`
  )
);
 
//initializing winston logger options
var transport = new winston.transports.DailyRotateFile({
  filename : "%DATE%-" + logFileName, //File name pattern to be made
  dirname : logDirectory, //Directory to store log files
  datePattern : dateFormat,
  zippedArchive : false, //Option for archeving the log files
  maxSize : global.settings.LOG_FILE_MAX_SIZE, //Maximum size for log file partition
  maxFiles : global.settings.LOGS_DELETE_LIMIT, //Remove files based on no. of days or no. of files
  extension : logFileExtension,
  handleExceptions : true
});
 
//creating logger instance
var logger = winston.createLogger({
  format : logFormat,
  transports : [transport]
});
 
/**
 * utils/WinstonLogger
 * @module
 */
module.exports = {
  /**
   * Function to fetch the FileName, FunctionName and LineNumber correponding to the call and log in the required format
   * @param {string} level - error, info, debug
   * @param {string} message
   */
  Log : (level, message) => {
  
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) {
      return stack;
    };
    var err = new Error();
    
    filteredStack = err.stack.filter(
      (element) =>
        element.getFileName() != null &&
        !(
          element.getFileName().includes("node:internal") &&
          element.getFileName().includes("node_modules")
        )
    );
 
    let i = 1; //used to refer to first index of the filteredStack asthe details of the calling function are present on the first index
 
    Error.prepareStackTrace = orig;
    loggerFileName = path.basename(filteredStack[i].getFileName());
    loggerLineNumber = filteredStack[i].getLineNumber();
   
    loggerFunctionName =
      filteredStack[i].getFunctionName() != null
        ? filteredStack[i].getFunctionName()
        : filteredStack[i + increment_value].getFunctionName();
    message = loggerFunctionName + message;
    //generating log
    logger.log(level, message);
  }
};