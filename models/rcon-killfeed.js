const MySQL = require('../app/services/mysql');
const Leaderboard = require('./leaderboard');
class RconKillfeed{

    constructor(){
        this.leaderboard = new Leaderboard();
        this.mySQL = MySQL.singleton();
    }

    async saveKill(data){
        if(!this._validSaveKill(data)){
            console.log(`Invalid payload passed to SaveKill()`);
            return;
        }

        const killerID = await this._updateLeaderboardKill(data);
        const killedID = await this._updateLeaderboardDeath(data);

        if(killerID === null || killedID === null){
            console.warn('Invalid payload passed to saveKill()');
            return;
        }

        const params = {killer_leaderboard_id: killerID, killed_leaderboard_id: killedID, created_at: data.created_at, updated_at: data.created_at};

        this.mySQL.connect( connection => {
            connection.query('INSERT INTO killfeed SET ?', params, (error, result, field) => {
                connection.release();
                if(error) console.warn(error);
            });
        });
    }

    selectVsKills(data){
        if(!this._validSelectKills(data)){
            console.log(`Invalid payload passed to SelectKills()`);
            return;
        }

        const params = [];

        this.mySQL.connect( connection => {
            connection.query('SELECT killer_playfabid, killed_playfabid, count(*) AS count FROM killfeed WHERE killer_id IN ? AND killed_id IN ? GROUP BY killer_id, killed_id', params, (error, results, field) => {
                connection.release();
                return results;
                if(error) throw error;
            });
        });
    }

    _updateLeaderboardKill(data){
        return this.leaderboard.upsertKill(data);
    }

    _updateLeaderboardDeath(data){
        return this.leaderboard.upsertDeath(data);
    }

    _validSaveKill(payload){
        if(typeof payload.killer === 'undefined' || typeof payload.killed === 'undefined' || typeof payload.created_at === 'undefined') return false;
        
        return true;
    }
}

module.exports = RconKillfeed;