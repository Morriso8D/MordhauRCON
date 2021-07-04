const mysql = require('mysql2');
require('dotenv').config({path:__dirname+'/.env'});

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

connection.connect();

module.exports = connection;