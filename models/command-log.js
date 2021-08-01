const MySQL = require('../app/services/mysql');

class CommandLog{

    constructor(){
        this.mySQL = MySQL.singleton();
    }

    getLastCommand(playfabid, command = null){
        let query;
        let params;

        if(command){
            query = `SELECT * 
            FROM command_log 
            WHERE playfabid = ?
            AND COMMAND = ?
            ORDER BY id DESC 
            LIMIT 1;`
            params = [playfabid,command];
        }else{
            query = `SELECT * 
            FROM command_log 
            WHERE playfabid = ? 
            ORDER BY id DESC 
            LIMIT 1;`
            params = [playfabid];
        }
        
        return new Promise((resolve, reject) => {
            this.mySQL.connect(connection => {
                connection.query(query, params, (error, result, field) => {
                    connection.release();
                    if(error){
                        reject(error);
                        return;
                    }
                    resolve(result);
                });
            });
        });
    }
}

module.exports = CommandLog;