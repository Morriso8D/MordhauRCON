
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

    async upsertKill(data){
        if(!this._validUpdateRank(data.killer.playfab) || !this._validUpdateRank(data.killed.playfab)){ //prevents bots from being recorded
            console.log(`Invalid payload passed to updateRank()`);
            return;
        }

        const killerData = [data.killer.playfab, data.killer.name];

        return new Promise( (resolve, reject) => {
            this.mySQL.connect(connection => {
                connection.query('INSERT INTO leaderboard (playfabid,name,kills,deaths,k_d,created_at,updated_at) VALUES(?,?,1,0,1,NOW(),NOW()) ON DUPLICATE KEY UPDATE id = id, name = VALUES(name), kills = kills + 1, k_d = (kills / NULLIF(deaths,0)),updated_at = NOW(), created_at = created_at', killerData, (error, result, field) => {
                    connection.release();
                    if(error){
                        reject(error);
                        return;
                    };
                    connection.release();
                    console.log('ranked kill updated');
                    resolve(result.insertId);
                });
            });
        });
    }

    async upsertDeath(data){
        if(!this._validUpdateRank(data.killed.playfab) || !this._validUpdateRank(data.killer.playfab)){ //prevents bots from being recorded
            console.log(`Invalid payload passed to updateRank()`);
            return;
        }

        const killedData = [data.killed.playfab, data.killed.name];

        return new Promise( (resolve, reject) => {
            this.mySQL.connect(connection => {
                connection.query('INSERT INTO leaderboard (playfabid,name,kills,deaths,k_d,created_at,updated_at) VALUES(?,?,0,1,0,NOW(),NOW()) ON DUPLICATE KEY UPDATE id = id, name = VALUES(name), deaths = deaths + 1, k_d = (NULLIF(kills,0) / deaths), updated_at = NOW(), created_at = created_at', killedData, (error, result, field) => {
                    connection.release();
                    if(error){
                        reject(error);
                        return;
                    }
                    console.log('ranked death updated');
                    resolve(result.insertId);
                });
            });
        });
    }

    async  updateAllRanks(){
        return new Promise( (resolve, reject) => {
            this.mySQL.connect(connection => {
                connection.query(`
                update leaderboard as leader
                inner join (
                    select l.id,l.kills,l.deaths,l.k_d,
                    ((l.kills - l.deaths) *10 *l.k_d) as score,
                    (select @curRank := @curRank + 1 ) as cur_rank
                    from leaderboard as l, (select @curRank := 0) as r
                    order by score desc
                ) as a on leader.id = a.id
                set leader.rank = a.cur_rank`, (error, result, field) => {
                    connection.release();
                    if(error){
                        reject(error);
                        return;
                    }
                    console.log('leaderboard ranks updated');
                    resolve(result);
                });
            });
        });
    }

    // Move to seperate validation file
    _validUpdateRank(playfab){
        if(playfab.match(/^[A-Z0-9]{14,16}$/)) return true;

        return false;
    }
}

module.exports = Leaderboard;