const MySQL = require('../app/services/mysql');

class Leaderboard {
    constructor(){
        this.mySQL = MySQL.singleton();
    }

    getRank(playfab){
        this.mySQL.connect(connection => {
            connection.query('SELECT * FROM leaderboard WHERE playfabid = ?', playfab, (error,result,field) => {
                connection.release();
                if(error) throw error;
                return result;
            });
        });
    }

    updateKill(data){
        if(!this._validUpdateRank(data.killer.playfab) || !this._validUpdateRank(data.killed.playfab)){ //prevents bots from being recorded
            console.log(`Invalid payload passed to updateRank()`);
            return;
        }

        const killerData = [data.killer.playfab, data.killer.name];

        this.mySQL.connect(connection => {
            connection.query('INSERT INTO leaderboard (playfabid,name,kills,deaths,k_d,created_at,updated_at) VALUES(?,?,1,0,1,NOW(),NOW()) ON DUPLICATE KEY UPDATE id = id, name = VALUES(name), kills = kills + 1, k_d = (NULLIF(kills,0) / deaths),updated_at = NOW(), created_at = created_at', killerData, (error, result, field) => {
                connection.release();
                if(error) throw error;
                console.log('ranked kill updated');
            });
        });
    }

    updateDeath(data){
        if(!this._validUpdateRank(data.killed.playfab) || !this._validUpdateRank(data.killer.playfab)){ //prevents bots from being recorded
            console.log(`Invalid payload passed to updateRank()`);
            return;
        }

        const killedData = [data.killed.playfab, data.killed.name];

        this.mySQL.connect(connection => {
            connection.query('INSERT INTO leaderboard (playfabid,name,kills,deaths,k_d,created_at,updated_at) VALUES(?,?,0,1,0,NOW(),NOW()) ON DUPLICATE KEY UPDATE id = id, name = VALUES(name), deaths = deaths + 1, k_d = (kills / deaths), updated_at = NOW(), created_at = created_at', killedData, (error, result, field) => {
                connection.releae();
                if(error) throw error;
                console.log('ranked death updated');
            });
        });
    }

    _validUpdateRank(playfab){
        if(playfab.match(/^[A-Z0-9]{14,16}$/)) return true;

        return false;
    }
}

module.exports = Leaderboard;