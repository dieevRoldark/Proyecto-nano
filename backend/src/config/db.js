import mysql from 'mysql2/promise';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4',
});

const CREATE_DATABASE_SQL =
  `CREATE DATABASE IF NOT EXISTS \`${config.db.name}\` ` +
  `DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci`;

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS \`contacts\` (
    \`id\`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    \`nombre\`     VARCHAR(100) NOT NULL,
    \`apellido\`   VARCHAR(100) NOT NULL,
    \`email\`      VARCHAR(254) NOT NULL,
    \`mensaje\`    TEXT NOT NULL,
    \`ip_address\` VARCHAR(45)  DEFAULT NULL,
    \`created_at\` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    INDEX \`idx_email\` (\`email\`),
    INDEX \`idx_created_at\` (\`created_at\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

export async function ensureDatabase() {
  const adminConn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    charset: 'utf8mb4',
    connectTimeout: 10000,
  });

  try {
    await adminConn.query(CREATE_DATABASE_SQL);
    logger.info('Database ensured', { name: config.db.name });
    await adminConn.query(`USE \`${config.db.name}\``);
    await adminConn.query(CREATE_TABLE_SQL);
    logger.info('Schema ensured', { table: 'contacts' });
  } finally {
    await adminConn.end();
  }
}

export async function testConnection() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    logger.info('MySQL connection OK', {
      host: config.db.host,
      database: config.db.name,
    });
  } finally {
    conn.release();
  }
}

export async function closePool() {
  await pool.end();
  logger.info('MySQL pool closed');
}

export default pool;
