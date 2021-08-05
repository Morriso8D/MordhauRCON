const Discord = require('discord.js');
require('dotenv').config()

let instance = null;
class DiscordClient{

    constructor(){
        this.client = new Discord.Client();
        this.client.login(process.env.DISCORD_BOT_TOKEN);
    }

    static singleton(){
        if(!instance){
            instance = new DiscordClient;
        }

        return instance;
    }

    
}

module.exports = DiscordClient;