const config = require('../../config.json');

class DiscordController{

    config = config;

    constructor(){

    }

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

    shadowPingDelete(message){
        if(message.author.bot) return;
        const users = message.mentions.users.array();
        const roles = message.mentions.roles.array();

        if(users.length){
            const userTags = users.map(x => `<@${x.id}>`);
            message.reply(`shadow ping detected - ${userTags.join(' ')}`);
        }
        if(roles.length){
            const roleTags = roles.map(x => `<@&${x.id}>`);
            message.reply(`shadow ping detected - ${roleTags.join(' ')}`);
        }
        if(message.mentions.everyone){
          message.reply(`shadow ping detected - everyone...`);
        }
    }

    shadowPingUpdate(oldMessage, newMessage){
        if(oldMessage.author.bot || newMessage.author.bot) return;
        console.log('message altered');
        const oldUsers = oldMessage.mentions.users.array();
        const oldRoles = oldMessage.mentions.roles.array();
        const newUsers = newMessage.mentions.users.array();
        const newRoles = newMessage.mentions.roles.array();

       if(oldUsers.length > newUsers.length || oldRoles.length > newRoles.length){ // stop late mentions from flagging
            // create an array of old and new  users/roles then compare the diff
            let oldUserIds = oldUsers.map( x => x.id );
            let newUserIds = newUsers.map( x => x.id );
            let oldRoleIds = oldRoles.map( x => x.id );
            let newRoleIds = newRoles.map( x => x.id );

            const ghostPingedUserIds = oldUserIds.filter( x => !newUserIds.includes(x) );
            const ghostPingedRoleIds = oldRoleIds.filter( x => !newRoleIds.includes(x) );

            const diffUsers = oldUsers.filter( x => ghostPingedUserIds.includes(x.id) );
            const diffRoles = oldRoles.filter( x => ghostPingedRoleIds.includes(x.id) );

            if(diffUsers.length){
                const diffUsersTag = diffUsers.map( x => `<@${x.id}>`);
                oldMessage.reply(`shadow ping detected - ${diffUsersTag.join(' ')}`);
            }

            if(diffRoles.length){
                const diffRolesTag = diffRoles.map( x => `<@&${x.id}>`);
                oldMessage.reply(`shadow ping detected - ${diffRolesTag.join(' ')}`);
            }
       }
    }

    _buildCommand(parsedMessage){
        const commandIndex = this.commands.findIndex( command => parsedMessage.command === command.name);
        const command = this.commands[commandIndex].name;

        return `${command} ${parsedMessage.args.join(' ')}`;
    }
}

module.exports = DiscordController;