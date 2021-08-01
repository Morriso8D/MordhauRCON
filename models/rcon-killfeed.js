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

        if(!killerID || !killedID){
            console.warn('Invalid payload passed to saveKill()');
            return;
        }

        const rankResponse = await this._updateLeaderboardRanks();

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
            connection.query('SELECT killer_leaderboard_id, killed_leaderboard_id, count(*) AS count FROM killfeed WHERE killer_leaderboard_id IN ? AND killed_leaderboard_id IN ? GROUP BY killer_leaderboard_id, killed_leaderboard_id', params, (error, results, field) => {
                connection.release();
                return results;
                if(error) throw error;
            });
        });
    }

    async _updateLeaderboardKill(data){
        return this.leaderboard.upsertKill(data).then( id => { return id; }).catch(err => console.log(err));
    }

    async _updateLeaderboardDeath(data){
        return this.leaderboard.upsertDeath(data).then(id => { return id;}).catch(err => console.log(err));
    }

    async _updateLeaderboardRanks(){
        return this.leaderboard.updateAllRanks().then(response => { return response;}).catch(err => console.log(err));
    }

    _validSaveKill(payload){
        if(typeof payload.killer === 'undefined' || typeof payload.killed === 'undefined' || typeof payload.created_at === 'undefined') return false;
        
        return true;
    }
}

module.exports = RconKillfeed;