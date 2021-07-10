const Discord = require('../app/services/discord');
const Helpers = require('../app/helpers');
const DiscordController = require('../app/controllers/discord-controller');

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
discordController.ghostPing(message);
}).on('messageUpdate', (message) => {
discordController.ghostPing(message);
}).on('guildMemberAdd', (member) => {
const channel = member.guild.channels.cache.find(ch => ch.name === 'general');
if(!channel) return;

channel.send(`Welcome to the server, ${member}`); 
member.addRole(member.guild.roles.find(role => role.name === 'Dung-covered peasant'));
});