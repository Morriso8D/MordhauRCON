const mysql = require('mysql');

let instance = null;
class MySQL{

    conn;

    constructor(){
        this.conn = mysql.createPool({
            connectionLimit: 10,
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'cronch'
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