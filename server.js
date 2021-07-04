require('dotenv').config({path:__dirname+'/.env'});
const Response = require('./resources/js/mordhau-response')
const Rcon = require('./resources/js/mordhau-rcon');
const Discord = require('./resources/js/discord');
// require('./models/rcon-chat');
const RconKillfeed = require('./models/rcon-killfeed');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})


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

let conn = new Rcon(process.env.RCON_HOST, process.env.RCON_PORT, process.env.RCON_SECRET, options);
const discord = new Discord();
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
let response = new Response(commands);

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
  
  if(response.hasMessage(str)){
    discord.client.channels.cache.get('839952559749201920').send(str);
  }

  if(response.hasCommand(str)){
    conn.send(response.getCommand());
    console.log(`Command sent: ${response.getCommand()}`);
  }

  if(response.hasBlacklistedWord(str)){
    const mute = response.getOneDayMuteCommand();
    conn.send(mute.command);
    conn.send(`say Auto-mod: ${mute.name} was muted for 1 day.`);
  }

  if(response.hasMatchState(str)){
    if(response.getMatchState() == 'In progress'){ // Changed map
      // send 'info' cmd
      // get the current map
      // listen to response (hasInfo) and update the current map
      conn.send('info');
    }
  }

  if(response.hasPunishment(str)){
        discord.client.channels.cache.get('842075143136084008').send(str);
  }

  if(response.hasInfo(str)){ // updates map info

  }

  if(response.hasKillfeed(str)){
    // console.log(response.getKillfeed());
    rconKillfeed.saveKill(response.getKillfeed());
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
  if(!message.content.startsWith(discord.prefix)) return;
  if(!discord.isAuthed(message.author.id)) return;

  const parsedMessage = discord.parseMessage(message, discord.prefix);

  if(!discord.hasCommand(parsedMessage)){
    message.reply('Invalid command');
    return;
  }

  sendCommand(conn, discord.getCommand(parsedMessage))
  .then(result => {
    message.reply(result);
  })
  .catch(error => {
    console.warn(error);
  })

});

readline.on('line', (input) => {
  conn.send(input);
})