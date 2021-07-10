const Discord = require('discord.js');
const config = require('../../config.json');
require('dotenv').config({path:__dirname+'/.env'})

class DiscordClient{

    prefix = '!';

    commands = [
        {
            name: 'say',
        },
        {
            name: 'playerlist'
        },
        {
            name: 'mutelist'
        },
        {
            name: 'adminlist'
        },
        {
            name: 'banlist'
        },
        {
            name: 'kick'
        },
        {
            name: 'teleportplayer'
        },
        {
            name: 'killplayer'
        },
        {
            name: 'info'
        },
        {
            name: 'stats'
        },
        {
            name: 'renameplayer'
        },
        {
            name: 'addbots'
        },
        {
            name: 'removebots'
        },
        {
            name: 'ban'
        },
        {
            name: 'unban'
        },
        {
            name: 'mute'
        },
        {
            name: 'unmute'
        },
        {
            name: 'help'
        },
        {
            name: 'addadmin'
        },
        {
            name: 'removeadmin'
        },
        {
            name: 'scoreboard'
        },
        {
            name: 'changelevel'
        },
    ]

    constructor(){
        this.client = new Discord.Client();
        this.client.login(process.env.DISCORD_BOT_TOKEN);
    }

    isAuthed(id){
        if(!config.authed_admins.includes(id)) return false;
        return true;
    }

    parseMessage(message, prefix){
        const commandBody = message.content.slice(prefix.length);
        const args = commandBody.split(' ');
        const command = args.shift().toLocaleLowerCase();
      
        return {
          commandBody: commandBody,
          args: args,
          command: command
        }
    }

    hasCommand(parsedMessage){
        if(this.commands.findIndex( (command) => parsedMessage.command === command.name) == -1) return false;
        return true;
    }

    getCommand(parsedMessage){
        return this._buildCommand(parsedMessage);
    }

    ghostPing(message){
        if(message.author.bot) return;
        const users = message.mentions.users.array();
        const roles = message.mentions.roles.array();
        if(users.length >= 1){
          message.reply(`ghost pinging huh? <@${users[0].id}>`);
        }
        if(roles.length >= 1){
          message.reply(`ghost pininged huh? <@&${roles[0].id}>`);
        }
        if(message.mentions.everyone){
          message.reply(`How dare you ghost ping everyone...`);
        }
    }

    _buildCommand(parsedMessage){
        const commandIndex = this.commands.findIndex( command => parsedMessage.command === command.name);
        const command = this.commands[commandIndex].name;

        return `${command} ${parsedMessage.args.join(' ')}`;
    }
}

module.exports = DiscordClient;