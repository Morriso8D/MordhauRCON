const { addListener } = require('../connection');
const connection = require('../connection');

class Ranking {
    constructor(){

    }

    getRank(playfab){
        connection.query('SELECT * FROM ranking WHERE playfabid = ?', playfab, (error,result,field) => {
            if(error) throw error;
            return result;
        });
    }

    updateRankKill(data){
        if(!this._validUpdateRank(data.killer.playfab)){
            console.log(`Invalid payload passed to updateRank()`);
            return;
        }

        const killerData = [data.killer.playfab, data.killer.name];

        connection.query('INSERT INTO ranking (playfabid,name,kills,deaths,created_at,updated_at) VALUES(?,?,1,0,NOW(),NOW()) ON DUPLICATE KEY UPDATE id = id, name = VALUES(name), kills = kills + 1, updated_at = NOW(), created_at = created_at', killerData, (error, result, field) => {
            if(error) throw error;
            console.log('ranked kill updated');
        });

    }

    updateRankDeath(data){
        if(!this._validUpdateRank(data.killed.playfab)){
            console.log(`Invalid payload passed to updateRank()`);
            return;
        }

        const killedData = [data.killed.playfab, data.killed.name];

        connection.query('INSERT INTO ranking (playfabid,name,kills,deaths,created_at,updated_at) VALUES(?,?,0,1,NOW(),NOW()) ON DUPLICATE KEY UPDATE id = id, name = VALUES(name), deaths = deaths + 1, updated_at = NOW(), created_at = created_at', killedData, (error, result, field) => {
            if(error) throw error;
            console.log('ranked death updated');
        });
    }

    _validUpdateRank(playfab){
        if(playfab.match(/^[A-Z0-9]{14,16}$/)) return true;

        return false;
    }
}

module.exports = Ranking;