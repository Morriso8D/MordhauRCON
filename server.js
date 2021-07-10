require('dotenv').config({path:__dirname+'/.env'});
const RconController = require('./app/controllers/mordhau-rcon-controller');
const Rcon = require('./app/services/rcon');
const Discord = require('./app/services/discord');
const RconKillfeed = require('./models/rcon-killfeed');
const DiscordController = require('./app/controllers/discord-controller');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});


const options = {
  tcp: true,
  challenge: false,
}

const sendCommand = async function (client, command) {
  if ((typeof command === 'string') && (client.hasAuthed)) {
      await client.send(command);
      return await new Promise(function(resolve, reject) {
          client.once('response', response => { 
            resolve(response); 
          }).once('error', error => {
            reject(error);
          });
      });
  }
};

const conn = Rcon.singleton(process.env.RCON_HOST, process.env.RCON_PORT, process.env.RCON_SECRET, options);
const discord = Discord.singleton();
const discordController = new DiscordController();
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
  sendCommand(conn,'listen chat').then(res => {
    sendCommand(conn,'listen matchstate').then(res => {
      sendCommand(conn,'listen punishment').then(res => {
        sendCommand(conn,'info').then(res => {
          sendCommand(conn,'listen killfeed').catch(err =>console.warn(err))
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
    console.log(`Command sent: ${response.getCommand()}`);
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

  sendCommand(conn, discordController.getCommand(parsedMessage))
  .then(result => {
    message.reply(result);
  })
  .catch(error => {
    console.warn(error);
  })

})
.on('messageDelete', (message) => {
  discordController.ghostPing(message);
})
.on('messageUpdate', (message) => {
  discordController.ghostPing(message);
})
.on('guildMemberAdd', (member) => {
  console.log('hereeee', member.guild.channels.array());
  const channel = member.guild.channels.cache.find(ch => ch.name === 'general');
  if(!channel) return;

  channel.send(`Welcome to the server, ${member}`); 
  member.addRole(member.guild.roles.find(role => role.name === 'Dung-covered peasant'));
});

readline.on('line', (input) => {
  conn.send(input);
})