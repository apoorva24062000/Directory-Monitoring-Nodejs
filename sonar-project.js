/**
 * Project Name : Relay Server
 * @company YMSLI
 * @author  Himanshu
 * @date    Feb 01, 2023
 * Copyright (c) 2023, Yamaha Motor Solutions (INDIA) Pvt Ltd.
 * 
 * Module: Sonar Cube
 * ----------------------------------------------------------------------------------- 
 * Description:=>
 * Contains the functions to Initialize Sonar Cube Testing
 * 
 * Use of this File:=> 
 * This File is used to generate the Sonar Report for Code Quality 
 * 
 * Steps to use this File:=>
 * 1.) Install the sonarqube-scanner npm package. Use command "npm i sonarqube-scanner".
 * 2.) Add script (sonar: "node sonar-project.js") in package.json file.
 * 3.) Run this script using npm command from the terminal. Run command "npm run sonar".
 * -----------------------------------------------------------------------------------
 * 
 * Revision History
 * -----------------------------------------------------------------------------------
 * Modified By          Modified On         Description
 * Himanshu             Feb 01, 2023        Initially Created
 * -----------------------------------------------------------------------------------
 */
const sonarqubeScanner = require('sonarqube-scanner');
sonarqubeScanner({
  serverUrl: 'https://codequality.ymslilabs.com:8443',
  options: {
    'sonar.sources': '.',
    'sonar.exclusions': 'node_modules/**,Logs/**,Server/Common/Utils/Enums/macResultsFieldsPosEnums.js,Server/Common/Utils/Parsers/ReportPacketParser-AOI.js,Server/Common/Utils/Parsers/ReportPacketParser-Printer-Mounter.js,Common/Logger/serverlogger.js,Common/Logger/communicationLogger.js',
  }
}, () => {});