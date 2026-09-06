import mysql from "mysql2/promise";

const MYSQL_HOST = process.env.MYSQL_HOST || "127.0.0.1";
const MYSQL_PORT = Number(process.env.MYSQL_PORT) || 3306;
const MYSQL_USER = process.env.MYSQL_USER || "root";
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || "root";
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || "csv_demo";



// Create connection pool
export const pool = mysql.createPool({
  host: MYSQL_HOST,
  port: MYSQL_PORT,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

let isInitialized = false;

export async function initDatabase() {
  if (isInitialized) return;

  try {
    // 1. Ensure Database exists
    const adminConnection = await mysql.createConnection({
      host: MYSQL_HOST,
      port: MYSQL_PORT,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
    });

    await adminConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await adminConnection.end();

    // 2. Ensure Tables exist
    const connection = await pool.getConnection();

    try {
      // Create metadata table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`csv_metadata\` (
          \`id\` INT PRIMARY KEY,
          \`columns\` JSON NOT NULL,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Create rows table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS \`csv_rows\` (
          \`id\` VARCHAR(64) PRIMARY KEY,
          \`data\` JSON NOT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      isInitialized = true;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Failed to initialize MySQL Database:", error);
    throw error;
  }
}
