/**
 * Project Name: Directory Monitoring
 * @company YMSLI
 * @author  Apoorva Singh
 * @date    Jan 24, 2024
 * Copyright (c) 2023, Yamaha Motor Solutions (INDIA) Pvt Ltd.
 * -----------------------------------------------------------------------------------
 * Description
 * -----------------------------------------------------------------------------------
 * - setSocketIOInstance: Function to set the Socket.IO instance.
 * - emitFileMoved: Function to emit a socket event when a file is moved.
 * - emitUnsupportedFile: Function to emit a socket event for an unsupported file.
 * - RecycleMovedFile: Function to emit a socket event when a file is moved to the Recycle Bin.
 * - emitFolderCounts: Function to emit a socket event with folder counts.
 * -----------------------------------------------------------------------------------
 * Revision History
 * -----------------------------------------------------------------------------------
 * Modified By          Modified On         Description
 * Apoorva Singh       Jan 24, 2024           Initially created
 * Apoorva Singh       Feb 16, 2024
 * -----------------------------------------------------------------------------------
 */

let io;
/**
 * @function setSocketIOInstance
 * @description Sets the Socket.IO instance to be used for emitting events.
 * @param {Object} socketIO - The Socket.IO instance.
 */
function setSocketIOInstance(socketIO) {
  io = socketIO;
}
/**
 * @function emitFileMoved
 * @description Emits a "fileMoved" event with the specified filename and destination folder to connected clients.
 * @param {string} filename - The name of the moved file.
 * @param {string} destinationFolder - The destination folder of the moved file.
 */
function emitFileMoved(filename, destinationFolder) {
  io.emit("fileMoved", { filename, destinationFolder });
  
}
/**
 * @function emitUnsupportedFile
 * @description Emits an "unsupportedFile" event with the specified filename and message to connected clients.
 * @param {string} filename - The name of the unsupported file.
 * @param {string} message - The message indicating why the file is unsupported.
 */
function emitUnsupportedFile(filename, message) {
  io.emit("unsupportedFile", { filename, message });
}


/**
 * @function RecycleMovedFile
 * @description Emits a "RecycleMoved" event with the specified filename and message to connected clients.
 * @param {string} filename - The name of the moved file.
 * @param {string} message - The message related to the moved file.
 */
function RecycleMovedFile(filename, message) {
  io.emit("RecycleMoved", { filename, message });
}

/**
 * @function emitFolderCounts
 * @description Emits a "folderCounts" event with the specified counts to connected clients.
 * @param {Object} counts - The counts related to folders.
 */
function emitFolderCounts(counts) {
  io.emit("folderCounts", counts);
}

module.exports = {
  setSocketIOInstance,
  emitFileMoved,
  emitUnsupportedFile,
  emitFolderCounts,
  RecycleMovedFile
};