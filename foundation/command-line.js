const Rcon = require('../app/services/rcon');
const options = {
    tcp: true,
    challenge: false,
};
const conn = Rcon.singleton(process.env.RCON_HOST, process.env.RCON_PORT, process.env.RCON_SECRET, options);
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
  

readline.on('line', (input) => {
    conn.send(input);
});