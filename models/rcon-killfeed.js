const mysql = require('mysql');
const date = require('date-and-time');
const connection = require('../connection');

// connection.query('SELECT 1 + 1 AS solution', (error,results,fields) => {
//     if(error) throw error;
//     console.log('The solution is: ' + results[0].solution);
// });

// connection.query('INSERT INTO rcon_chat')
// connection.end();

// const now = new Date(); 
// const chat = {playfab_id:'2653203C1FE7F188', name:'plzHelpM3', message: 'looks like it should be highest tbh', created_at: date.format(now, 'YYYY-MM-DD HH:mm:ss')};

// connection.query('INSERT INTO rcon_chat SET ?', chat, (error, result, field) => {
//     if(error) throw error;
//     console.log(result);
// });

// connection.query('SELECT * FROM rcon_chat', (error, result, field) => {
//     if(error) throw error;
//     console.log(result);
// })

// connection.end();

class RconKillfeed{
    constructor(){

    }

    saveKill(data){
        if(!this._validSaveKill(data)){
            console.log(`Invalid payload passed to SaveKill()`);
            return;
        }

            const params = {killer_id: data.killer.playfab, killed_id: data.killed.playfab, created_at: data.created_at};

            connection.query('INSERT INTO rcon_killfeed SET ?', params, (error, result, field) => {
                if(error) throw error;
            });
    }

    selectVsKills(data){
        if(!this._validSelectKills(data)){
            console.log(`Invalid payload passed to SelectKills()`);
            return;
        }

        const params = [];

        connection.query('SELECT killer_id, killed_id, count(*) AS count FROM rcon_killfeed WHERE killer_id IN ? AND killed_id IN ? GROUP BY killer_id, killed_id', params, (error, results, field) => {
            if(error) throw error;
            return results;
        });
    }

    _validSaveKill(payload){
        if(typeof payload.killer === 'undefined' || typeof payload.killed === 'undefined' || typeof payload.created_at === 'undefined') return false;
        
        return true;
    }

    _validSelectVsKills(payload){
    }
}

module.exports = RconKillfeed;