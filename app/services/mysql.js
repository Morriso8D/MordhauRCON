require('dotenv').config();
const mysql = require('mysql2');

let instance = null;
class MySQL{

    conn;

    constructor(){
        this.conn = mysql.createPool({
            connectionLimit: 10,
            host: process.env.DB_HOST,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });
    }

    connect(query){
        this.conn.getConnection(function(err, connection) {
            if(err) console.warn(err);

            query(connection);
        });
    }

    static singleton(){
        if(!instance){
            instance = new MySQL();
        }

        return instance;
    }
}

module.exports = MySQL;