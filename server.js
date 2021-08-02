require('dotenv').config({path:__dirname+'/.env'});
const RconController = require('./app/controllers/mordhau-rcon-controller');
const Rcon = require('./app/services/rcon');
const Discord = require('./app/services/discord');
const RconKillfeed = require('./models/rcon-killfeed');
const DiscordController = require('./app/controllers/discord-controller');
const Helpers = require('./app/helpers');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});


const options = {
  tcp: true,
  challenge: false,
}

const conn = Rcon.singleton(process.env.RCON_HOST, process.env.RCON_PORT, process.env.RCON_SECRET, options);
const discord = Discord.singleton();
const discordController = new DiscordController();
const rconKillfeed = new RconKillfeed();

/**
 * Example extending
 */
const commands = [
  {
    parseMatch: '/tp oopsie',
    mapArgs: {
      'Contraband': 'x=0,y=0,z=10000',
      'Arena':  'x=0,y=0,z=10000',
      'Moshpit': 'x=0,y=0,z=10000'
    },
    info: "don\'t do it...",
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
conn.on('auth', async () => {
  
  console.log("Authed!\n Enter a command:");
  
  await Helpers.sendAsync(conn, 'listen chat');
  await Helpers.sendAsync(conn, 'listen matchstate');
  await Helpers.sendAsync(conn, 'listen punishment');
  await Helpers.sendAsync(conn, 'listen killfeed');
  await Helpers.sendAsync(conn, 'info');

}).on('response', async (str) => {
  console.log("Got response: " + str);
  
  if(rconController.hasMessage(str)){
    discord.client.channels.cache.get('839952559749201920').send(str.replace(/[^a-zA-Z0-9()\?\:]/ig,' '));
  }

  if(rconController.hasCommand(str)){
    const command = await rconController.getCommand();
    conn.send(command);
    console.log(`Command sent: ${command}`);
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
},30000 )


/**
 * 
 * Discord Events
 * 
 */
discord.client.on('message', (message) => {
  if(message.author.bot) return;
  if(!message.content.startsWith(discordController.prefix)) return;
  if(!discordController.isAuthed(message.author.id)) return;

  const parsedMessage = discordController.parseMessage(message, discordController.prefix);

  if(!discordController.hasCommand(parsedMessage)){
    message.reply('Invalid command');
    return;
  }

  Helpers.sendAsync(conn, discordController.getCommand(parsedMessage)).then(result => {
    message.reply(result);
  }).catch(error => {
    console.warn(error);
  });

}).on('messageDelete', (message) => {
  discordController.shadowPingDelete(message);
}).on('messageUpdate', (oldMessage, newMessage) => {
  discordController.shadowPingUpdate(oldMessage, newMessage);
}).on('guildMemberAdd', (member) => {
  const channel = member.guild.channels.cache.find(ch => ch.name === 'general');
  if(!channel) return;

  channel.send(`Welcome to the server, ${member}`); 
  member.addRole(member.guild.roles.find(role => role.name === 'Dung-covered peasant'));
});

readline.on('line', (input) => {
  conn.send(input);
  // discord.client.channels.cache.get('773155679262474262').send(input, {tts: true});
})