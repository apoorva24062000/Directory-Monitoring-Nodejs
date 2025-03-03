/**
 * Project Name : Directory Monitoring
 * @company YMSLI
 * @author  Apoorva Singh
 * @date    Jan 24, 2024
 * Copyright (c) 2023, Yamaha Motor Solutions (INDIA) Pvt Ltd.
 * -----------------------------------------------------------------------------------
 * Description
 * -----------------------------------------------------------------------------------
* -. GET /checkEmail/:email: Endpoint for checking duplicate email during user registration.
 * -. POST /register: Endpoint for user registration.
 * - POST /login: Endpoint for user login.
 * - GET /getcount: Endpoint to get file counts in the last 3 days.
 * - GET /getfilename: Endpoint to get file names.
 * - GET /getFileContent/:folder/:filename: Endpoint to get the content of a file.
 * - GET /findFilePath/:filename: Endpoint to find the path of a file.
 * - GET /compressfile/:filename: Endpoint to compress and send a file.
 * - GET /doctopdf/:filename: Endpoint to convert a DOC file to PDF.
 * - POST /resizeImage/:filename: Endpoint to resize and send an image.
 * - GET /csvtopdf/:filename: Endpoint to convert CSV files to PDF.
 * - GET /exceltopdf/:filename: Endpoint to convert Excel files to PDF.
 * - POST /moveToRecycleBin/:filename: Endpoint to move a file to the Recycle Bin.
 * 
 * -----------------------------------------------------------------------------------
 * Revision History
 * -----------------------------------------------------------------------------------
 * Modified By          Modified On         Description
 * Apoorva Singh       Jan 24,2024           Initially created
 
 * -----------------------------------------------------------------------------------
 */
const express = require("express");
const router = express.Router();
const fs = require("fs");

const userController = require("../controller/UserController");
const FileController = require("../controller/FileController")
// const folderPathToMonitor = global.settings.FolderToMonitorPlaceholder; 


  // fileUploadController.initializeSocket(io);
  router.post("/register", userController.register);
  router.post("/login", userController.login);
  router.get("/checkEmail/:email", userController.duplicateEmail);
  router.get("/checkusername/:username",userController.duplicateUsername)


  router.get('/getcount', (req, res) => {
    const counts = FileController.countFilesLast3Days();
    // console.log(counts);
    res.json({ counts });
  });
  
  // Endpoint to get file names
  router.get('/getfilename', (req, res) => {
    const names = FileController.displayAllFileNames(); // Call the function to get file names
    res.json({ names });
  });
  
  router.get('/getFileContent/:folder/:filename',(req,res)=>{
    const result=
    res.json({result})
  });
  
  
  
  // Route to get file path and content count
  router.get('/findFilePath/:filename', async (req, res) => {
    const { filename } = req.params;
    const result = await FileController.findFilePathByFileName(global.settings.FolderTomonitor, filename);
  
    if (result) {
      // Use getFileContent to get content count
      if (fs.existsSync(result.filePath)) {
        const content = await FileController.getFileContent(result.filePath);
        const contentLines = content.split('\n');
        res.json({  contentLines });
      } else {
        res.status(404).json({ error: global.settings.notFound });
      }
    } else {
      res.status(404).json({ error: global.settings.notFound });
    }
  });
  
  
  router.get('/compressfile/:filename', FileController.compressAndSendFile);
  router.get('/doctopdf/:filename',FileController.doctopdf)
  //  app.get('/resizeimage/:filename',controller.resizeAndSendImage);
  router.post('/resizeImage/:filename', FileController.resizeImage);
  router.get('/csvtopdf/:filename',FileController.csvToPdf)
  router.get('/exceltopdf/:filename',FileController.convertExcelToPdf)
  router.post("/moveToRecycleBin/:filename",FileController.moveFileToRecycleBin);







module.exports = router;
  

