const mysql = require('mysql');
const date = require('date-and-time');
const connection = require('../connection');
const Ranking = require('./ranking');
class RconKillfeed{

    constructor(){
        this.ranking = new Ranking();
    }

    saveKill(data){
        if(!this._validSaveKill(data)){
            console.log(`Invalid payload passed to SaveKill()`);
            return;
        }

            const params = {killer_playfabid: data.killer.playfab, killed_playfabid: data.killed.playfab, created_at: data.created_at};

            connection.query('INSERT INTO rcon_killfeed SET ?', params, (error, result, field) => {
                if(error) throw error;
            });

            this._updateRankKill(data);
            this._updateRankDeath(data);
    }

    selectVsKills(data){
        if(!this._validSelectKills(data)){
            console.log(`Invalid payload passed to SelectKills()`);
            return;
        }

        const params = [];

        connection.query('SELECT killer_playfabid, killed_playfabid, count(*) AS count FROM rcon_killfeed WHERE killer_id IN ? AND killed_id IN ? GROUP BY killer_id, killed_id', params, (error, results, field) => {
            if(error) throw error;
            return results;
        });
    }

    _updateRankKill(data){
        return this.ranking.updateRankKill(data);
    }

    _updateRankDeath(data){
        return this.ranking.updateRankDeath(data);
    }

    _validSaveKill(payload){
        if(typeof payload.killer === 'undefined' || typeof payload.killed === 'undefined' || typeof payload.created_at === 'undefined') return false;
        
        return true;
    }

    _validSelectVsKills(payload){
    }
}

module.exports = RconKillfeed;