/**
 * This is the bot's main entry point. Feel free to modify it as you see fit. 
 **** WARNING: Changes outside of this file could be lost if the repo is updated! ****
 */

require('dotenv').config();
const RconController = require('./app/controllers/mordhau-rcon-controller');
const Rcon = require('./app/services/rcon');
const Helpers = require('./app/helpers');
const bootstrap = require('./bootstrap');
bootstrap.forEach( foundation => {
  require(foundation);
});


const options = {
  tcp: true,
  challenge: false,
}

const conn = Rcon.singleton(process.env.RCON_HOST, process.env.RCON_PORT, process.env.RCON_SECRET, options);


/**
 * Example extending server commands
 */
const commands = [
  {
    parseMatch: '/tp oopsie', // required
    mapArgs: { // optional
      'Contraband': 'x=0,y=0,z=100000',
      'Arena':  'x=0,y=0,z=100000',
      'Moshpit': 'x=0,y=0,z=100000'
    },
    info: "don\'t do it...", // optional
    exeMethod: (response) => { // required - returns a mordhau rcon command as a string
      const args = response.getMapArgs();
      return `teleportplayer ${response.getPlayfab()} ${args}`;
    }
  }
];
const rconController = new RconController(conn, commands);

/**
 * 
 * RCON Events
 * 
 */
conn.on('auth', async () => {
  
  console.log("Authed!\n Enter a command:");

  // initiate listening events
  await Helpers.sendAsync(conn, 'listen chat');
  await Helpers.sendAsync(conn, 'listen matchstate');
  await Helpers.sendAsync(conn, 'listen punishment');
  await Helpers.sendAsync(conn, 'listen killfeed');
  await Helpers.sendAsync(conn, 'info');

}).on('response', async (str) => {
  console.log("Got response: " + str);
  
  if(rconController.hasMessage(str)){
    rconController.handleMessage(str);
  }

  if(rconController.hasCommand(str)){
    const command = await rconController.getCommand();
    rconController.handleCommand(command);
  }

  if(rconController.hasBlacklistedWord(str)){
    const mute = rconController.getOneDayMuteCommand();
    rconController.handleBlacklistedWord(mute);
  }

  if(rconController.hasMatchState(str)){
    rconController.handleMatchState();
  }

  if(rconController.hasPunishment(str)){
    rconController.handlePunishment(str);
  }

  if(rconController.hasInfo(str)){
    // updates map info
  }

  if(rconController.hasKillfeed(str)){
    const kill = rconController.getKillfeed();
    await rconController.handleKill(kill);
  }

  if(rconController.hasPlayerlist(str)){
    // updates playerlist
  }

}).on('end', () => {
  console.log("Socket closed!");
  process.exit();

}).on('error', (error) => {
  console.log('error: '+error)
});

conn.connect();

// prevents mordhau from disconnecting when left idle
setInterval(()=> {
  conn.send('alive')
},30000 )