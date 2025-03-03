/**
 * Project Name : Directory Monitoring
 * @company YMSLI
 * @author Apoorva Singh
 * @date Jan 24, 2024
 * @copyright 2023, Yamaha Motor Solutions (INDIA) Pvt Ltd.

/**
 * @fileoverview PostgreSQL Database Connection
 * @description Creates a connection pool to PostgreSQL using the provided global settings.
 * -----------------------------------------------------------------------------------
 * Dependencies:
 * - pg: PostgreSQL client for Node.js.
 * -----------------------------------------------------------------------------------
 * * Revision History
* -----------------------------------------------------------------------------------
* Modified By          Modified On         Description
* Apoorva Singh       Jan 24,2024           Initially created

* -----------------------------------------------------------------------------------
*/





const { Pool } = require("pg");

const pool = new Pool({
  user: global.settings.pgUser,
  host: global.settings.pgHost,
  database: global.settings.pgDatabase,
  password: global.settings.pgPassword,
  port: global.settings.pgPort,
});

console.log("Database Configuration:");
console.log("User:", global.settings.pgUser);
console.log(pool);
module.exports = pool;