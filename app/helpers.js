

class Helpers{

    // Yuk! - but it'll do for now
    static sendAsync = async function (conn,command) {
        if ((typeof command === 'string') && (conn.hasAuthed)) {
            await conn.send(command);
            return new Promise((resolve, reject) => {
                conn.once('response', function responseListener(response){ 
                    conn.removeListener('response', responseListener);
                    resolve(response); 
                }).once('error', function errorListener(error){
                    conn.removeListener('error', errorListener);
                    reject(error);
                });
            });
        }
    }
}

module.exports = Helpers;