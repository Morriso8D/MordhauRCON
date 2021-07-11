

class Helpers{

    // Yuk! - but it'll do for now
    static sendAsync = async function (conn,command) {
        if ((typeof command === 'string') && (conn.hasAuthed)) {
            await conn.send(command);
            return await new Promise(function(resolve, reject) {
                conn.once('response', response => { 
                    resolve(response); 
                }).once('error', error => {
                    reject(error);
                });
            });
        }
    }
}

module.exports = Helpers;