const MySQL = require('../app/services/mysql');
const Leaderboard = require('./leaderboard');
class RconKillfeed{

    constructor(){
        this.leaderboard = new Leaderboard();
        this.mySQL = MySQL.singleton();
    }

    saveKill(data){
        if(!this._validSaveKill(data)){
            console.log(`Invalid payload passed to SaveKill()`);
            return;
        }

            const params = {killer_playfabid: data.killer.playfab, killed_playfabid: data.killed.playfab, created_at: data.created_at};

            this.mySQL.connect( connection => {
                connection.query('INSERT INTO rcon_killfeed SET ?', params, (error, result, field) => {
                    connection.release();
                    if(error) console.warn(error);
                });
            });

            this._updateLeaderboardKill(data);
            this._updateLeaderboardDeath(data);
    }

    selectVsKills(data){
        if(!this._validSelectKills(data)){
            console.log(`Invalid payload passed to SelectKills()`);
            return;
        }

        const params = [];

        this.mySQL.connect( connection => {
            connection.query('SELECT killer_playfabid, killed_playfabid, count(*) AS count FROM rcon_killfeed WHERE killer_id IN ? AND killed_id IN ? GROUP BY killer_id, killed_id', params, (error, results, field) => {
                connection.release();
                return results;
                if(error) throw error;
            });
        });
    }

    _updateLeaderboardKill(data){
        return this.leaderboard.updateKill(data);
    }

    _updateLeaderboardDeath(data){
        return this.leaderboard.updateDeath(data);
    }

    _validSaveKill(payload){
        if(typeof payload.killer === 'undefined' || typeof payload.killed === 'undefined' || typeof payload.created_at === 'undefined') return false;
        
        return true;
    }
}

module.exports = RconKillfeed;