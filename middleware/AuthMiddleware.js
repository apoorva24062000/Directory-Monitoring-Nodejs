/**
 * Project Name : Directory Monitoring
 * @company YMSLI
 * @author Apoorva Singh
 * @date Jan 24, 2024
 * @copyright 2023, Yamaha Motor Solutions (INDIA) Pvt Ltd.
 * -----------------------------------------------------------------------------------
/**
 * @fileoverview JWT Token Generation
 * @description Helper function to generate a JWT token for user authentication.
 * -----------------------------------------------------------------------------------
 * Functions:
 * - generateToken: Generates a JWT token with user email as the payload.
 * -----------------------------------------------------------------------------------
 *  * * -----------------------------------------------------------------------------------
 * Revision History
 * -----------------------------------------------------------------------------------
 * Modified By          Modified On         Description
 * Apoorva Singh       Jan 24,2024           Initially created
 
 * -----------------------------------------------------------------------------------
 */


const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign({ userId: user.email }, global.settings.KEY, {
    expiresIn: global.settings.TIME,
  });
};

module.exports = { generateToken };
