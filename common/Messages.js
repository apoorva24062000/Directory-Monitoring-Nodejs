/**
 * Project Name : Directory Monitoring
 * @company YMSLI
 * @author  Apoorva Singh
 * @date    Jan 24, 2024
 * Copyright (c) 2023, Yamaha Motor Solutions (INDIA) Pvt Ltd.
 * -----------------------------------------------------------------------------------
 * Description
 * -----------------------------------------------------------------------------------
 * 1. allFieldsRequired: Message indicating that all fields are required for a specific operation.
 * 2. userCreated: Message indicating successful user registration.
 * 3. registerFail: Message indicating an error during user registration.
 * 4. userLogin: Message indicating successful user login.
 * 5. loginFail: Message indicating a failure during the login process.
 * 6. invalidPass: Message indicating an invalid password during user login.
 * 7. unauthorizedToken: Message indicating an unauthorized request due to a missing token.
 * 8. duplicateFail: Message indicating an error checking duplicate email during registration.
 * 9. duplicateusername: Message indicating an error checking duplicate username during registration.
 * 10. fileMoved: Message indicating successful movement of a file to the Recycle Bin.
 * 11. fileMovedFail: Message indicating an error in moving a file to the Recycle Bin.
 * 12. fileConverted: Message indicating successful conversion and saving of a file.
 * 13. fileConvertedFail: Message indicating an error in converting and saving a file.
 * 14. imageResized: Message indicating successful resizing of an image.
 * 15. imageResizedFail: Message indicating an error in resizing an image.
 * -----------------------------------------------------------------------------------
 * Revision History
 * -----------------------------------------------------------------------------------
 * Modified By          Modified On         Description
 * Apoorva Singh       Jan 24,2024           Initially created
 * Apoorva Singh       Feb 16,2024
 * -----------------------------------------------------------------------------------
 */
module.exports = {
  allFieldsRequired: "All fields are required.",
  userCreated: " User registered  successfully.",
  registerFail: "Error in registering User",
  userLogin: "User Logged In successfully",
  registerFail: "Error in registering User",
  loginFail: "Login Failed",
  invalidPass: "Invalid Password",
  unauthorizedToken: "Unauthorized - Missing token",
  duplicateFail: "Error checking duplicate email",
  duplicateusername:"Error checking duplicate username",
  fileMoved:"File moved to Recycle Bin successfully",
  fileMovedFail:"Error in moving File to  Recycle Bin",
  fileConverted: "File converted and saved successfully",
  fileConvertedFail:"Error in converting and saving File",
  imageResized: "Image resized successfully",
  imageResizedFail:"Error in resizing image",
  notFound:"File not found"

  

};
