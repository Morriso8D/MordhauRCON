const Discord = require('../app/services/discord');
const Rcon = require('../app/services/rcon');
const Helpers = require('../app/helpers');
const DiscordController = require('../app/controllers/discord-controller');

const options = {
    tcp: true,
    challenge: false,
}
  
const conn = Rcon.singleton(process.env.RCON_HOST, process.env.RCON_PORT, process.env.RCON_SECRET, options);

const discord = Discord.singleton();
const discordController = new DiscordController();
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