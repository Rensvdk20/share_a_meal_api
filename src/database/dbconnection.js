require('dotenv').config();
const mysql = require('mysql2');
const logger = require('../config/tracer_config').logger;

const pool = mysql.createPool({
    connectionLimit : 100,
    waitForConnections: true,
    queueLimit: 0,
    multipleStatements: true,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

pool.on('connection', function (connection) {
    logger.debug(`Connected to database '${connection.config.database}'`)
});

module.exports = pool; 