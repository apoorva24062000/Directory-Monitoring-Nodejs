/**
 * Project Name : Directory Monitoring
 * @company YMSLI
 * @author  Apoorva Singh
 * @date    Jan 24, 2024
 * Copyright (c) 2023, Yamaha Motor Solutions (INDIA) Pvt Ltd.
 * -----------------------------------------------------------------------------------
 * Description
 * -----------------------------------------------------------------------------------
 * - register: Function for handling user registration.
 * - login: Function for handling user login.
 * - duplicateEmail: Function for checking duplicate email.
 * - duplicateUsername: Function for checking duplicate username.

 * -----------------------------------------------------------------------------------
 * Revision History
 * -----------------------------------------------------------------------------------
 * Modified By          Modified On         Description
 * Apoorva Singh       Jan 24,2024           Initially created
 
 * -----------------------------------------------------------------------------------
 */
const fs = require("fs");
const FileController = require("../controller/FileController");
const userService = require("../service/UserService");
const Joi = require("joi");
const { generateToken } = require("../middleware/AuthMiddleware");
const bcrypt = require("bcrypt");


/**
 * @function register
 * @description Handles user registration, creates a user folder, and responds with a success message.
 * @param {Object} req - Express request object containing user registration data.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
const register = async (req, res) => {
  global.log("info", "IN");

  try {
    const { name, username, email, password } = req.body;
    

    const result = await userService.registerUser(
      name,
      username,
      email,
      password
    );
    console.log(result,"    ");
logger.info(global.messages.userCreated)
    const folder = `${global.settings.path}/${req.body.username}`;

    if (!fs.existsSync(folder)) {
      // If it doesn't exist, create the folder
      fs.mkdirSync(folder);
    console.log(`Folder created: ${folder}`);
    } else {
      console.log(`Folder already exists: ${folder}`);
    }

    res.status(global.settings.HTTP_OK).json({ message: global.messages.userCreated, result });
  } catch (error) {

    res.status(global.settings.HTTP_INTERNAL_SERVER_ERROR).json({ error: global.messages.registerFail });
  }
  global.log("info", "OUT");

};

/**
 * @function login
 * @description Handles user login, validates credentials, monitors files, and responds with a token.
 * @param {Object} req - Express request object containing user login data.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
const login = async (req, res) => {
 
global.log("info", "IN");
  try {
    const { email, password } = req.body;
   

    if (!email || !password) {
      res.status(global.settings.HTTP_BAD_REQUEST).json({ error: global.messages.allFieldsRequired });
    }
    const user = await userService.loginUser(email);
    
    if (!user) {
      return res.status(global.settings.HTTP_NOT_FOUND).json({ error: global.messages.notFound });
    }
    const ispassvalid = await bcrypt.compare(password, user.password);

    if (!ispassvalid) {
      return res.status(global.settings.HTTP_UNAUTHORIZED).json({ error: global.messages.invalidPass });
    }
    global.settings.FolderTomonitor = `${global.settings.path}/${user.username}`;

    await FileController.monitorAndMoveFiles(global.settings.FolderTomonitor);

    const token = generateToken(user);

    const usernameinfo = user.name;
   global.log("info",global.messages.userLogin)

    res
      .status(global.settings.HTTP_OK)
      .json({ message: global.messages.userLogin, token, usernameinfo });
  } catch (error) {
    res.status(global.settings.HTTP_INTERNAL_SERVER_ERROR).json({ error: global.messages.loginFail });
   
  }
  global.log("info", "OUT");

};
/**
 * @function duplicateEmail
 * @description Checks if a duplicate email exists and responds accordingly.
 * @param {Object} req - Express request object containing the email parameter.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
const duplicateEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await userService.loginUser(email);

    if (user) {
      res.status(global.settings.HTTP_OK).json({ exists: true, user });
    } else {
      res.status(global.settings.HTTP_OK).json({ exists: false, user: null });
    }
  } catch (error) {
    // console.error('Error checking duplicate email:', error);
    res.status(global.settings.HTTP_INTERNAL_SERVER_ERROR).json({ error: global.messages.duplicateFail });
    // console.error('Error checking duplicate email:', error);
    // console.error('Error checking duplicate email:', error);
  
  }
};

/**
 * @function duplicateUsername
 * @description Checks if a duplicate username exists and responds accordingly.
 * @param {Object} req - Express request object containing the username parameter.
 * @param {Object} res - Express response object.
 * @returns {void}
 */
const duplicateUsername = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await userService.checkUsername(username);

    if (user) {
      res.status(global.settings.HTTP_OK).json({ exists: true, user });
    } else {
      res.status(global.settings.HTTP_OK).json({ exists: false, user: null });
    }
  } catch (error) {
    // console.error('Error checking duplicate email:', error);
    res.status(global.settings.HTTP_INTERNAL_SERVER_ERROR).json({ error: global.messages.duplicateusername });
  

  }
};

module.exports = {
  register,
  login,
  duplicateEmail,
  duplicateUsername,
};
