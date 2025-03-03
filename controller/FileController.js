/**
 * Project Name : Directory Monitoring
 * @company YMSLI
 * @author  Apoorva Singh
 * @date    Jan 24, 2024
 * Copyright (c) 2023, Yamaha Motor Solutions (INDIA) Pvt Ltd.
 * -----------------------------------------------------------------------------------
 * Description
 * -----------------------------------------------------------------------------------
 * - monitorAndMoveFiles: Function for monitoring a directory and moving files to specific folders.
 * - findFilePathByFileName: Function for finding the path of a file based on its name.
 * - getFileContent: Function for reading the content of a file.
 * - compressAndSendFile: Function for compressing and sending files as a zip archive.
 * - countFilesLast3Days: Function for counting files in the last 3 days in different folders.
 * - displayAllFileNames: Function for displaying all file names in various folders.
 * - doctopdf: Function for converting DOC files to PDF format.
 * - getFilesLast3Days: Function for retrieving files created in the last 3 days in a folder.
 * - resizeImage: Function for resizing images based on width and height parameters.
 * - csvToPdf:  Function to convert CSV files to PDF format.
 * - convertExcelToPdf:Function to convert Excel files to PDF format.
 * - moveFileToRecycleBin: Function to move a file to the Recycle Bin.
 * -----------------------------------------------------------------------------------
 * Revision History
 * -----------------------------------------------------------------------------------
 * Modified By          Modified On         Description
 * Apoorva Singh       Jan 24,2024           Initially created
 * Apoorva Singh       Feb 7,2024
 * Apoorva Singh       Feb 13,2024
 * -----------------------------------------------------------------------------------
 */

const csvtojson = require("csvtojson");
const fsextra = require("fs-extra");

const chokidar = require("chokidar");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { readdirSync, statSync, unlinkSync } = require("fs");
const officeConverter = require("office-converter")();

const Docxtemplater = require("docxtemplater");
const libre = require("libreoffice-convert");
libre.convertAsync = require("util").promisify(libre.convert);
const { exec } = require("child_process");
// const fs = require('fs').promises;

const unoconv = require("unoconv");
const officegen = require("officegen");
const exceljs = require("exceljs");
const pdfmake = require("pdfmake");

const mammoth = require("mammoth");
const pdf = require("html-pdf");
const sharp = require("sharp");
const socketController = require("./SocketController");

let csvFolder;
let pdfFolder;
let jsonFolder;
let imagesFolder;
let docFolder;
let excelFolder;

let csvCountLast3Days = 0;
let pdfCountLast3Days = 0;
let jsonCountLast3Days = 0;
let imagesCountLast3Days = 0;
let docCountLast3days = 0;
let excelCountLast3days = 0;

/**
 * Function to monitor a directory and move files to specific folders.
 * @param {string} folderPath - The path of the directory to monitor.
 * @returns {Object} - Object containing functions for monitoring and moving files.
 */
function monitorAndMoveFiles(folderPath) {
  global.log("info", "IN");

  csvFolder = path.join(folderPath, "csv");
  pdfFolder = path.join(folderPath, "pdf");
  jsonFolder = path.join(folderPath, "json");
  imagesFolder = path.join(folderPath, "images");
  docFolder = path.join(folderPath, "doc");
  excelFolder = path.join(folderPath, "excel");

  ensureDirectoryExists(csvFolder);
  ensureDirectoryExists(pdfFolder);
  ensureDirectoryExists(jsonFolder);
  ensureDirectoryExists(imagesFolder);
  ensureDirectoryExists(docFolder);
  ensureDirectoryExists(excelFolder);

  const watcher = chokidar.watch(folderPath, {
    ignored: /^\./,
    persistent: true,
  });

  watcher.on("add", async (filePath) => {
    const filename = path.basename(filePath);
    const ext = path.extname(filename);

    const destinationFolder = getDestinationFolder(ext);
    if (destinationFolder) {
      await moveFile(
        filePath,
        path.join(destinationFolder, filename),
        destinationFolder
      );
    } else {
      // console.log(`Unsupported file: ${filename}`);
      global.log("info",`Unsupported file: ${filename}`)

      socketController.emitUnsupportedFile(filename, "Unsupported file type");
    }
  });

  watcher.on("error", (error) => {
    console.error(`Error watching folder: ${error}`);
  });

  async function moveFile(sourcePath, destinationPath, subfolder) {
    global.log("info", "IN");

    try {
      fs.rename(sourcePath, destinationPath, (err) => {
        if (err) {
          // console.error(`Error moving ${subfolder} file: ${err}`);
          global.log("error",`Error moving ${subfolder} file: ${err}`)
        } else {
          global.log("info", `${subfolder} file moved: ${path.basename(destinationPath)}`)
          // console.log(
          //   `${subfolder} file moved: ${path.basename(destinationPath)}`
          // );
          socketController.emitFileMoved(
            path.basename(destinationPath),
            subfolder
          );
        }
      });
    } catch (error) {
      console.error(`Error moving ${subfolder} file: ${error}`);
    }
    global.log("info", "OUT");

  }

  function getDestinationFolder(extension) {
    const extensionMapping = {
      ".csv": csvFolder,
      ".pdf": pdfFolder,
      ".json": jsonFolder,
      ".png": imagesFolder,
      ".jpg": imagesFolder,
      ".jpeg": imagesFolder,
      ".docx": docFolder,
      ".xlsx": excelFolder,
      ".xlx": excelFolder,
    };

    return extensionMapping[extension];
  }

  function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }
  global.log("info", "OUT");

  return { monitorAndMoveFiles, moveFile };


}

/**
 * Function to find the path of a file based on its name.
 * @param {string} folderPath - The path of the main directory.
 * @param {string} fileName - The name of the file to find.
 * @returns {Object} - Object with the filePath property.
 */

async function findFilePathByFileName(folderPath, fileName) {
  try {
    const mainFolderPath = path.join(folderPath, fileName);
    if (fs.existsSync(mainFolderPath)) {
      return { filePath: mainFolderPath };
    }

    const subfolders = ["csv", "pdf", "json", "images", "doc", "excel"];
    for (const subfolder of subfolders) {
      const subfolderPath = path.join(folderPath, subfolder, fileName);
      if (fs.existsSync(subfolderPath)) {
        return { filePath: subfolderPath };
      }
    }

    return null;
  } catch (error) {
    console.error(`Error finding file path for ${fileName}: ${error}`);
    return null;
  }
}

/**
 * Function to read the content of a file.
 * @param {string} filePath - The path of the file to read.
 * @returns {Promise<string>} - A promise that resolves with the file content.
 */
async function getFileContent(filePath) {
  try {
    const content = await fs.promises.readFile(filePath, "utf-8");
    return content;
  } catch (error) {
    console.error(
      `Error reading file content from ${filePath}:`,
      error.message
    );
    throw error;
  }
}
/**
 * Function to compress and send a file as a zip archive.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
async function compressAndSendFile(req, res) {
  global.log("info", "IN");

  try {
    const { filename } = req.params;
   
    const result = await findFilePathByFileName(
      global.settings.FolderTomonitor,
      filename,
      res
    );
    const filePath = result.filePath;

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
    const fileExtension = path.extname(filename).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}.zip"`
    );
    const archive = archiver("zip");
    archive.pipe(res);
    archive.file(filePath, { name: filename });
    archive.finalize();
   
  } catch (error) {
    console.error("Error compressing file:", error.message);
    res.status(global.settings.HTTP_INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
  }
  global.log("info", "OUT");

}

/**
 * Function to check if a file is within the defined time.
 * @param {string} filePath - The path of the file to check.
 * @returns {boolean} - True if the file is within defined time, false otherwise.
 */
function isFileWithinLast3Days(filePath) {
  global.log("info", "IN");

  const stats = fs.statSync(filePath);
  const fileModifiedDate = stats.atime;
  const now = new Date();
  let timeAgo = new Date(now);

  if (global.settings.timeUnit === "days") {
    timeAgo.setDate(now.getDate() - global.settings.timeValue);
  } else if (global.settings.timeUnit === "hours") {
    timeAgo.setHours(now.getHours() - global.settings.timeValue);
  } else if (global.settings.timeUnit === "minutes") {
    timeAgo.setMinutes(now.getMinutes() - global.settings.timeValue);
  } else {
    throw new Error(
      "Invalid time unit. Supported units are: days, hours, minutes."
    );
  }
  global.log("info", "OUT");

  return fileModifiedDate >= timeAgo;


}

/**
 * Function to count files in a folder that are within the defined time.
 * @param {string} folder - The path of the folder to count files in.
 * @returns {number} - The count of files within the  defined time.
 */
function countFilesInFolderLast3Days(folder) {


  try {
    const files = readdirSync(folder);

    const filesLast3Days = files
      .map((file) => path.join(folder, file))
      .filter(isFileWithinLast3Days);

    return filesLast3Days.length;
  } catch (error) {
    return 0;
  }
 
}

/**
 * Function to count files in different folders within the defined time.
 * @returns {Object} - Object with counts for different file types and folders.
 */
function countFilesLast3Days() {
  csvCountLast3Days = countFilesInFolderLast3Days(csvFolder);
  pdfCountLast3Days = countFilesInFolderLast3Days(pdfFolder);
  jsonCountLast3Days = countFilesInFolderLast3Days(jsonFolder);
  imagesCountLast3Days = countFilesInFolderLast3Days(imagesFolder);
  docCountLast3days = countFilesInFolderLast3Days(docFolder);
  excelCountLast3days = countFilesInFolderLast3Days(excelFolder);

  return {
    csvCountLast3Days,
    pdfCountLast3Days,
    jsonCountLast3Days,
    imagesCountLast3Days,
    docCountLast3days,
    excelCountLast3days,
  };
}

/**
 * Function to display all file names in various folders.
 * @returns {Object} - Object with arrays of file names in different folders.
 */

function displayAllFileNames() {
  const main = getFilesLast3Days(global.settings.FolderTomonitor);
  deleteFilesOlderThan3Days(csvFolder);
  deleteFilesOlderThan3Days(pdfFolder);
  deleteFilesOlderThan3Days(excelFolder);
  deleteFilesOlderThan3Days(imagesFolder);
  deleteFilesOlderThan3Days(docFolder);
  deleteFilesOlderThan3Days(excelFolder);

  const ans = main.filter(
    (file) => !/(json|pdf|csv|images|doc|excel)/i.test(file.filename)
  );
  const allFileNames = {
    mainFiles: ans,
    csvFiles: getFilesLast3Days(csvFolder),
    pdfFiles: getFilesLast3Days(pdfFolder),
    jsonFiles: getFilesLast3Days(jsonFolder),
    imagesFiles: getFilesLast3Days(imagesFolder),
    docFiles: getFilesLast3Days(docFolder),
    excelFiles: getFilesLast3Days(excelFolder),
  };
  return allFileNames;
}

// const setIntervalTime = 9000;

// setInterval(() => {
//   const allFileName = displayAllFileNames();
// }, setIntervalTime);

/**
 * Function to delete files in a folder that are older than defined time.
 * @param {string} folder - The path of the folder to delete files from.
 */
function deleteFilesOlderThan3Days(folder) {
  global.log("info", "IN");

  try {
    const files = fs.readdirSync(folder);

    files.forEach((file) => {
      const filePath = path.join(folder, file);

      if (!isFileWithinLast3Days(filePath)) {
        // Delete the file
        recycleBin(file);
      }
    });
  } catch (error) {
    console.error(`Error deleting older files in folder ${folder}: ${error}`);
  }
  global.log("info", "OUT");

}

/**
 * Function to get files in a folder created in the defined time.
 * @param {string} folder - The path of the folder to get files from.
 * @returns {Array} - Array of objects representing files within the defined time.
 */
function getFilesLast3Days(folder) {
  try {
    const files = fs.readdirSync(folder);

    const filesLast3Days = files
      .map((file) => {
        const filePath = path.join(folder, file);
        const fileStats = fs.statSync(filePath);

        return {
          filename: file,
          folder: path.basename(folder),
          extension: path.extname(file).slice(1),
          creationDate: fileStats.birthtime,
        };
      })
      .filter((file) => isFileWithinLast3Days(path.join(folder, file.filename)));

    return filesLast3Days;
  } catch (error) {
    console.error(`Error getting file names in folder ${folder}: ${error}`);
    return [];
  }
}



/**
 * Function to convert DOC files to PDF format.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
async function doctopdf(req, res) {
  global.log("info", "IN");

  try {
    const { filename } = req.params;
    console.log(req.params);

    const docFilePathResult = await findFilePathByFileName(
      global.settings.FolderTomonitor,
      filename
    );

    if (!docFilePathResult) {
      return res.status(global,settings.HTTP_NOT_FOUND).json({ error: "File not found" });
    }

    const docFilePath = docFilePathResult.filePath;
    const pdfFilePath = path.join(
      pdfFolder,
      `${path.parse(filename).name}.pdf`
    );

    // Convert DOC to HTML using mammoth
    const conversionResult = await mammoth.extractRawText({
      path: docFilePath,
    });

    const htmlContent = conversionResult.value;

    // Convert HTML to PDF using html-pdf
    const pdfOptions = {
      format: "Letter",
      base: `file://${path.resolve("./")}/`, // Set the base path for assets (images, stylesheets, etc.)
      style: path.resolve("./path/to/your/custom-styles.css"), // Path to your custom styles
    }; // You can adjust the options as needed
    pdf.create(htmlContent, pdfOptions).toFile(pdfFilePath, (err) => {
      if (err) {
        console.error("Error converting HTML to PDF:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      socketController.emitFileMoved("fileMoved", {
        filename: `${path.parse(filename).name}.pdf`,
        subfolder: "pdf",
      });
      // Respond with success message
      global.log("info",global.settings.fileConverted)
      res.json({
        message: global.settings.fileConverted,
      });
    });
  } catch (error) {
    
    res.status(global.settings.HTTP_INTERNAL_SERVER_ERROR).json({ error: global.settings.fileConvertedFail });
  }
  global.log("info", "OUT");

}

/**
 * Function to resize images based on width and height parameters.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
async function resizeImage(req, res) {
  global.log("info", "IN");

  try {
    const { filename } = req.params;
    const { width, height } = req.body; // Extract width and height from query parameters
    console.log(req.params, req.query);

    const imageFilePathResult = await findFilePathByFileName(
      global.settings.FolderTomonitor,
      filename
    );

    if (!imageFilePathResult) {
      return res.status(global.settings.HTTP_NOT_FOUND).json({ error: "File not found" });
    }

    const imageFilePath = imageFilePathResult.filePath;

    // Check if width and height are provided, otherwise use default values
    const resizeOptions = {};
    if (width) {
      resizeOptions.width = parseInt(width);
    }
    if (height) {
      resizeOptions.height = parseInt(height);
    }

    // Resize the image
    const resizedImageBuffer = await sharp(imageFilePath)
      .resize(resizeOptions)
      .toBuffer();

    // Determine the output file path
    const outputExtension = path.extname(filename).toLowerCase();

    const uniqueIdentifier = `${width}_${height}`;
    const uniqueFilename = `${
      path.parse(filename).name
    }_resized_${uniqueIdentifier}${outputExtension}`;

    const resizedImagePath = path.join(
      global.settings.FolderTomonitor,
      "images",
      uniqueFilename
    );

    // Save the resized image
    await fs.promises.writeFile(resizedImagePath, resizedImageBuffer);
global.log("info",global.settings.imageResized)
    res.json({
      message: global.settings.imageResized,
      resizedImagePath,
    });
  } catch (error) {
    
    res.status(global.settings.HTTP_INTERNAL_SERVER_ERROR).json({ error: global.settings. imageResizedFail });
  }
  global.log("info", "OUT");

}
/**
 * Function to convert CSV files to PDF format.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
async function csvToPdf(req, res) {
  global.log("info", "IN");


  try {
    const { filename } = req.params;

    // Find the path of the CSV file
    const csvFilePathResult = await findFilePathByFileName(
      global.settings.FolderTomonitor,
      filename
    );


    if (!csvFilePathResult) {
      return res.status(global.settings.HTTP_NOT_FOUND).json({ error: "File not found" });
    }

    const csvFilePath = csvFilePathResult.filePath;

    // Convert CSV to JSON
    const jsonArray = await csvtojson().fromFile(csvFilePath);

    const headers = Object.keys(jsonArray[0]);

    const htmlContent = `<html><body><table border="1">
    <tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr>
    ${jsonArray
      .map(
        (row) =>
          `<tr>${Object.values(row)
            .map((value) => `<td>${value}</td>`)
            .join("")}</tr>`
      )
      .join("")}
  </table></body></html>`;

    // Convert HTML to PDF
    const pdfFilePath = path.join(
      pdfFolder,
      `${path.parse(filename).name}.pdf`
    );

    const pdfOptions = {
      format: "Letter",
      base: `file://${path.resolve("./")}/`, // Set the base path for assets (images, stylesheets, etc.)
      style: path.resolve("./path/to/your/custom-styles.css"),
      timeout: 90000,
    };

    pdf.create(htmlContent, pdfOptions).toFile(pdfFilePath, (err) => {
      if (err) {
       
        return res.status(global.settings.HTTP_INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
      }

      socketController.emitFileMoved("fileMoved", {
        filename: `${path.parse(filename).name}.pdf`,
        subfolder: "pdf",
      });
global.log("info",global.settings.fileConverted)
      // Respond with success message
      res.json({
        message: global.settings.fileConverted,
      });
    });
  } catch (error) {
    res.status(global.settings.HTTP_INTERNAL_SERVER_ERROR).json({ error: global.settings.fileConvertedFail });
  }
  global.log("info", "OUT");

}
/**
 * Function to convert Excel files to PDF format.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
async function convertExcelToPdf(req, res) {
  global.log("info", "IN");

  try {
    const { filename } = req.params;

    // Find the path of the Excel (.xlsx) file
    const excelFilePathResult = await findFilePathByFileName(
      global.settings.FolderTomonitor,
      filename
    );

    if (!excelFilePathResult) {
      return res.status(404).json({ error: "File not found" });
    }

    const excelFilePath = excelFilePathResult.filePath;

    // Read Excel file
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(excelFilePath);

    // Convert each sheet to an array of arrays
    const sheetData = [];
    workbook.eachSheet((sheet) => {
      const sheetRows = [];
      sheet.eachRow((row) => {
        sheetRows.push(row.values);
      });
      sheetData.push({
        sheetName: sheet.name,
        rows: sheetRows,
      });
    });

    // Create HTML content from the sheet data
    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: 'Arial, sans-serif';
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #dddddd;
              text-align: left;
              padding: 8px;
            }
          </style>
        </head>
        <body>
          ${sheetData
            .map(
              (sheet) => `
            <h2>${sheet.sheetName}</h2>
            <table>
              <tr>${sheet.rows[0]
                .map((header) => `<th>${header}</th>`)
                .join("")}</tr>
              ${sheet.rows
                .slice(1)
                .map(
                  (row) =>
                    `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`
                )
                .join("")}
            </table>
          `
            )
            .join("")}
        </body>
      </html>
    `;

    // Convert HTML to PDF
    const pdfFilePath = path.join(
      pdfFolder,
      `${path.parse(filename).name}.pdf`
    );

    pdf.create(htmlContent).toFile(pdfFilePath, (err) => {
      if (err) {
        console.error("Error converting HTML to PDF:", err);
        return res.status(global.settings.HTTP_INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
      }

      // Notify file movement
      socketController.emitFileMoved("fileMoved", {
        filename: `${path.parse(filename).name}.pdf`,
        subfolder: "pdf",
      });
global.log("info",global.settings.fileConvertedFail)
      // Respond with success message
      res.json({
        message: global.settings.fileConverted,
      });
    });
  } catch (error) {
    
    res.status(global.settings.HTTP_INTERNAL_SERVER_ERROR).json({ error: global.settings.fileConvertedFail });
  }
  global.log("info", "IOUT");

}
/**
 * Function to move a file to the Recycle Bin.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
async function moveFileToRecycleBin(req, res) {
  global.log("info", "IN");

  try {
    const { filename } = req.params;

    const filePathResult = await findFilePathByFileName(
      global.settings.FolderTomonitor,
      filename
    );

    if (!filePathResult) {
      return res.status(404).json({ error: "File not found" });
    }

    const filePath = filePathResult.filePath;

    const destinationPath = path.join(global.settings.recycleBinPath, filename);

    await fsextra.move(filePath, destinationPath, { overwrite: true });

    global.log("info",`File moved to Recycle Bin: ${filename}`);
    res.json({ message: global.settings.filemoved});
  } catch (error) {
    
    res.status(global.settings.HTTP_INTERNAL_SERVER_ERROR).json({ error: global.settings.fileMovedFail });
  }
  global.log("info", "OUT");

}
/**
 * Function to move a file to the Recycle Bin.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
async function recycleBin(filename) {
  global.log("info", "IN");

  try {
    const filePathResult = await findFilePathByFileName(
      global.settings.FolderTomonitor,
      filename
    );

    if (!filePathResult) {
      return;
    }

    const filePath = filePathResult.filePath;

    const destinationPath = path.join(global.settings.recycleBinPath, filename);
    await fsextra.move(filePath, destinationPath, { overwrite: true });
    global.log("info",`File moved to Recycle Bin: ${path.basename(filename)}`);
    socketController.RecycleMovedFile(filename, "fileeemovedddd");

    return true;
  } catch (error) {
    // console.error("Error moving file:", error.message);
    return false;
  }
  

}

module.exports = {
  monitorAndMoveFiles,
  findFilePathByFileName,
  getFileContent,
  compressAndSendFile,
  countFilesLast3Days,
  displayAllFileNames,
  doctopdf,
  getFilesLast3Days,
  resizeImage,
  csvToPdf,
  convertExcelToPdf,
  moveFileToRecycleBin,
};
