const MySQL = require('../app/services/mysql');

class CommandLog{

    constructor(){
        this.mySQL = MySQL.singleton();
    }

    async getLastCommand(playfabid, command = null){
        let query;
        let params;

        if(command){
            query = `SELECT * 
            FROM command_log 
            WHERE playfabid = ?
            AND command = ?
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

    async saveCommand(playfabid, command){
        if(!playfabid || !command){
            console.warn(`Invalid payload passed to saveCommand() in command-log.js: playfabid: ${playfabid}, command: ${command}`);
            return;
        }
        const params = [playfabid, command]
        return new Promise((resolve, reject) => {
            this.mySQL.connect(connection => {
                connection.query(`
                INSERT INTO command_log (playfabid, command, created_at, updated_at)
                VALUES (?,?, NOW(), NOW())
                `, params, (error, result, field) => {
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