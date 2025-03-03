/**
 * Project Name : Directory Monitoring 
 * @company YMSLI
 * @author  Apoorva Singh
 * @date    Jan 24,2024
 * Copyright (c) 2023, Yamaha Motor Solutions (INDIA) Pvt Ltd.
 *
 * Description
 * -----------------------------------------------------------------------------------
 * This module contains the following public functions:
 * 1. registerUser - Function to handle user registration, hash password, and store in the database.
 * 2. loginUser     - Function to handle user login, fetch user details from the database.
 * 3. checkUsername - Function to check if a username already exists in the database.
 * -----------------------------------------------------------------------------------
 *
 * Revision History
 * -----------------------------------------------------------------------------------
 * Modified By          Modified On         Description
 
 * Apoorva Singh        Jan 24, 2024        Modified for user registration and login functionality.
 * -----------------------------------------------------------------------------------
 */

const bcrypt = require("bcrypt");
const pool = require("../data_access/database/db");
const UserQueries = require("../data_access/queries/UserQueries");

/**
 * @function registerUser
 * @description Handles user registration, hash password, and store in the database.
 * @param {string} name - User's name
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<void>} - A promise that resolves when the registration is successful.
 * @throws {Error} - Throws an error if registration fails.
 */
const registerUser = async (name,username ,email, password) => {
  try {
    // Hash the user's password before storing in the database
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Store user details in the database
    const result=  await pool.query(UserQueries.register, [name, username,email, hashedPassword]);
    return result.rows[0]; // Assuming the query returns the created user data

  } catch (error) {
    
    throw error;
  }
};

/**
 * @function loginUser
 * @description Handles user login, fetch user details from the database.
 * @param {string} email - User's email
 * @returns {Promise<Object|null>} - A promise that resolves with the user details if login is successful, otherwise null.
 * @throws {Error} - Throws an error if login fails.
 */
const loginUser = async (email) => {
  try {
    // Fetch user details from the database based on the email
    const result = await pool.query(UserQueries.login, [email]);
    
    // Return the user details
    return result.rows[0];
  } catch (error) {

    throw error;
  }
};
/**
 * @function checkUsername
 * @description Checks if a username already exists in the database.
 * @param {string} username - User's username to be checked
 * @returns {Promise<Object|null>} - A promise that resolves with the user details if the username exists, otherwise null.
 * @throws {Error} - Throws an error if the database operation fails.
 */

const checkUsername = async (username) => {
  try {
    // Fetch user details from the database based on the email
    const result = await pool.query(UserQueries.usernamecheck, [username]);
    
    // Return the user details
    return result.rows[0];
  } catch (error) {

    throw error;
  }
};
module.exports = {
  registerUser,
  loginUser,
  checkUsername
};
