require('dotenv').config({path:__dirname+'/.env'});
const RconController = require('../app/controllers/mordhau-rcon-controller');
const Rcon = require('../app/services/rcon');
const RconKillfeed = require('../models/rcon-killfeed');
const Helpers = require('../app/helpers');

const options = {
    tcp: true,
    challenge: false,
}

const conn = Rcon.singleton(process.env.RCON_HOST, process.env.RCON_PORT, process.env.RCON_SECRET, options);
const rconKillfeed = new RconKillfeed();

/**
 * Example extending
 */
const commands = [
{
    parseMatch: '/tp sky',
    mapArgs: {
    'Contraband': 'x=0,y=0,z=10000',
    'Arena':  'x=0,y=0,z=10000',
    'Moshpit': 'x=0,y=0,z=10000'
    },
    exeMethod: (response) => {
    const args = response.getMapArgs();
    return `teleportplayer ${response.getPlayfab()} ${args}`;
    }
}
];
const rconController = new RconController(commands);

/**
 * 
 * RCON Events
 * 
 */
conn.on('auth', () => {

console.log("Authed!\n Enter a command:");
Helpers.sendAsync(conn,'listen chat').then(res => {
    Helpers.sendAsync(conn,'listen matchstate').then(res => {
    Helpers.sendAsync(conn,'listen punishment').then(res => {
        Helpers.sendAsync(conn,'info').then(res => {
        Helpers.sendAsync(conn,'listen killfeed').catch(err =>console.warn(err))
        }).catch(err=>console.warn(err));
    }).catch(err=>console.warn(err));
    }).catch(err=>console.warn(err));
}).catch(err=>console.warn(err));


}).on('response', (str) => {
console.log("Got response: " + str);

if(rconController.hasMessage(str)){
    discord.client.channels.cache.get('839952559749201920').send(str.replace(/[^a-zA-Z0-9()\?\:]/ig,' '));
}

if(rconController.hasCommand(str)){
    conn.send(rconController.getCommand());
    console.log(`Command sent: ${rconController.getCommand()}`);
}

if(rconController.hasBlacklistedWord(str)){
    const mute = rconController.getOneDayMuteCommand();
    conn.send(mute.command);
    conn.send(`say Auto-mod: ${mute.name} was muted for 1 day.`);
}

if(rconController.hasMatchState(str)){
    if(rconController.getMatchState() == 'In progress'){ // Changed map
    // send 'info' cmd
    // get the current map
    // listen to response (hasInfo) and update the current map
    conn.send('info');
    }
}

if(rconController.hasPunishment(str)){
        discord.client.channels.cache.get('842075143136084008').send(str);
}

if(rconController.hasInfo(str)){ // updates map info

}

if(rconController.hasKillfeed(str)){
    rconKillfeed.saveKill(rconController.getKillfeed());
}

}).on('end', () => {
console.log("Socket closed!");
process.exit();

}).on('error', (error) => {
console.log('error: '+error)
});

conn.connect();

setInterval(()=> {
conn.send('alive')
},30000 );