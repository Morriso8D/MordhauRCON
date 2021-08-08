const CommandLog = require("../../models/command-log");
const Killfeed = require('../../models/rcon-killfeed');
const Leaderboard = require('../../models/leaderboard');
const config = require('../../config.json');

class MordhauRconController{

  constructor(rcon, commands = [], chatBlacklist = []){
    
    if(commands.length){
      this.commandWhitelist = this.commandWhitelist.concat(commands);
    }

    if(chatBlacklist.length){
      this.chatBlacklist = this.chatBlacklist.concat(chatBlacklist);
    }

    const options = {
      tcp: true,
      challenge: false,
    }

    this.commandLog = new CommandLog();
    this.rcon = rcon;
    this.Killfeed = new Killfeed();
    this.leaderboard = new Leaderboard();

    // pull config requirements
    if(config.bootstrap.discord){
      this.discordConn = require('../services/discord').singleton();
    }
  }

  discord = config.discord.link;

  commandWhitelist = [
      {
        parseMatch: '/admin',
        exeMethod: '_buildRequestAdminCommand',
        info: 'Request an admin',
        requires: 'discord'
      },
      {
        parseMatch: '/commands',
        exeMethod: '_buildCommandList',
        info: 'List of available commands'
      },
      {
        parseMatch: '/leaderboard',
        exeMethod: '_buildGetLeaderboardCommand',
        info: 'Link to our leaderboard',
        requires: 'leaderboard'
      },
      {
        parseMatch: '/discord',
        exeMethod: '_buildDiscordCommand',
        info: 'Link to our discord',
        requires: 'discord'
      },
      {
        parseMatch: '/tp rock',
        exeMethod: '_buildTpRockCommand',
        mapArgs: {
          'Contraband':'x=-13200,y=7100,z=400',
        },
        info: 'Teleport' 
      },
      {
        parseMatch: '/tp top',
        exeMethod: '_buildTpTopCommand',
        mapArgs: {
          'Camp':'x=0,y=0,z=3500',
          'Contraband':'x=0,y=0,z=2500',
          'Arena':'x=0,y=0,z=2000',
          'Highlands':'x=9743,y=-13563,z=-1303',
          'The Pit':'x=0,y=0,z=2000',
          'Tourney':'x=0,y=0,z=2000',
          'Truce':'x=0,y=0,z=2000',
          'Moshpit':'x=1,y=5000,z=3500'
        },
        info: 'Teleport'
      },
      {
        parseMatch: '/tp middle',
        exeMethod: '_buildTpMiddleCommand',
        mapArgs: {
          'Camp':'x=0,y=0,z=1200',
          'Contraband':'x=0,y=0,z=1200',
          'Arena':'x=0,y=0,z=0',
          'Highlands':'x=10000,y=-14000,z=-3500',
          'The Pit':'x=0,y=0,z=0',
          'Tourney':'x=0,y=0,z=500',
          'Truce':'x=0,y=0,z=0',
          'Moshpit':'x=1,y=5000,z=2200'
        },
        info: 'Teleport' 
      },
      {
        parseMatch: '/tp menu',
        exeMethod: '_buildTpMenuCommand',
        mapArgs: {
          'Contraband':'x=-5359,y=327,z=-606',
          'The Pit':'x=-5500,y=-2700,z=1000',
          'Highlands':'x=5567,y=-19298,z=-3077',
          'Truce':'x=2786,y=2007,z=134',
        },
        info: 'Teleport'
      },
      {
        parseMatch: '/tp pillar',
        exeMethod: '_buildTpPillarCommand',
        mapArgs: {
          'Contraband':'x=400,y=0,z=2000'
        },
        info: 'Teleport'
      },
      {
        parseMatch: '/tp cage',
        exeMethod: '_buildTpCageCommand',
        mapArgs: {
          'Highlands': 'x=10264,y=-11758,z=-3450'
        },
        info: 'Teleport'
      },
      {
        parseMatch: '/tp cart',
        exeMethod: '_buildTpCartCommand',
        mapArgs: {
          'Highlands': 'x=8391,y=-15256,z=-3360'
        },
        info: 'Teleport'
      },
      {
        parseMatch: '/tp stonehenge',
        exeMethod: '_buildTpStonehengeCommand',
        mapArgs: {
          'Highlands': 'x=-32940,y=-45509,z=-2378'
        },
        info: 'Teleport'
      },
      {
        parseMatch: '/tp pen',
        exeMethod: '_buildTpPenCommand',
        mapArgs: {
          'Highlands': 'x=8610,y=-16307,z=-3359'
        },
        info: 'Teleport'
      },
      {
        parseMatch: '/tp net',
        exeMethod: '_buildTpNetCommand',
        mapArgs: {
          'Contraband': 'x=-500,y=-700,z=2300'
        },
        info: 'Teleport'
      },
      {
        parseMatch: '/tp arena2',
        exeMethod: '_buildTpFT10Command',
        mapArgs: {
          'Contraband': 'x=3200,y=3500,z=4000'
        },
        info: 'Teleport'
      },
      {
        parseMatch: '/tp arena',
        exeMethod: '_buildTpFT102Command',
        mapArgs: {
          'Contraband': 'x=3200, y=-3500,z=4000',
          'Moshpit': 'x=-10000,y=5000,z=6400',
        },
        info: 'Teleport'
      }
  ];

    chatBlacklist = config.blacklisted_words;

    respData = {
      playfab: null,
      name: null,
      message: null,
      killfeed: null,
      commandIndex: null,
      matchState: null,
      gamemode: null,
      map: null,
      playerlist: null,
      rankKillCount: null,
    }

    async getCommand(){
      // Exe methods can either be a string (pointer) or function
      if(typeof this.commandWhitelist[this.respData.commandIndex].exeMethod === 'string'){
        return await this[this.commandWhitelist[this.respData.commandIndex].exeMethod]();
      }
      return await this.commandWhitelist[this.respData.commandIndex].exeMethod(this);
    }

    getPlayfab(){
      return this.respData.playfab;
    }

    getName(){
      return this.respData.name;
    }

    getMessage(){
      return this.respData.message;
    }

    getMapArgs(){
      return this.commandWhitelist[this.respData.commandIndex].mapArgs[this.respData.map];
    }

    getMatchState(){
      return this.respData.matchState;
    }

    getOneDayMuteCommand(){
      return {
        command: this._buildMuteForOneDayCommand(),
        name: this.respData.name
      };
    }

    getMap(){
      return this.respData.map;
    }

    getGamemode(){
      return this.respData.gamemode;
    }

    getKillfeed(){
      return this.respData.killfeed;
    }

    getPlayerlist(){
      return this.respData.playerlist;
    }
    
    hasCommand(resp){
    
      const respChunk = this._iniParseChat(resp);
      if(typeof respChunk !== 'undefined' && this._matchPlayfab(respChunk[0])) {

        const [playfabid, name, message] = respChunk;

            this.respData.playfab = playfabid;
            this.respData.name = name;
            this.respData.message = message.match(/^\s\((.*)\)\s(.*)/)[2];

          this.respData.commandIndex = this._parseForCommand(this.respData.message);

          // checks if the whitelist contains the command
          if(this.respData.commandIndex === -1) return false; // No command found

          // checks if the command has a config requirement
          const requires = this.commandWhitelist[this.respData.commandIndex]?.requires;
          if(requires && (config.bootstrap[requires] ?? false) === false) return false; // requirement not enabled

          return true;
      }
    }

    hasKillfeed(resp){
      const data = this._iniParseKillfeed(resp);

      if (typeof data !== 'undefined'){
        this.respData.killfeed = data;
        return true;
      }
      return false;
    }

    hasMessage(resp){
      
      const respChunk = this._iniParseChat(resp);

      if(typeof respChunk !== 'undefined') return true;
      return false;
    }

    hasBlacklistedWord(resp){

      const respChunk = this._iniParseChat(resp);

      if(typeof respChunk !== 'undefined' && this._matchPlayfab(respChunk[0])) {

        const [playfabid, name, message] = respChunk;

        this.respData.playfab = playfabid;
        this.respData.name = name;
        this.respData.message = message.match(/^\s\((.*)\)\s(.*)/)[2];

        if(this._parseForChatBlacklist(this.respData.message) === -1) return false;

        return true;
      }
    }

    hasMatchState(resp){

      const respChunk = this._iniParseMatchState(resp);

      if(typeof respChunk === 'undefined') return false; // response isn't MatchState
      
      this.respData.matchState = respChunk;

      return true; // response is MatchState
    }

    hasInfo(resp){

      const respChunk = this._iniParseInfo(resp);

      if(typeof respChunk === 'undefined') return false; // response isn't Info

      this.respData.gamemode = respChunk.gamemode;
      this.respData.map = respChunk.map;

      return true; // response is Info
    }

    hasPlayerlist(resp){
      const respChunk = this._iniParsePlayerlist(resp);

      if(typeof respChunk !== 'undefined'){

        this.respData.playerlist = respChunk;

        return true;
      }
    }

    hasPunishment(resp){
      const respChunk = this._iniParsePunishment(resp);

      if(typeof respChunk === 'undefined') return false;
      return true;
    }

    handleMessage(str){
      // reports the chat to discord
      if(config.bootstrap.discord){
        this.discordConn.client.channels.cache.get(config.discord.chat_channel_id).send(str.replace(/[^a-zA-Z0-9()\?\:]/ig,' '));
      }
    }

    handleCommand(command){
      this.rcon.send(command);
      console.log(`Command sent: ${command}`);
    }

    handleBlacklistedWord(mute){
      this.rcon.send(mute.command);
      this.rcon.send(`say Auto-mod: ${mute.name} was muted for 1 day.`);
    }

    handleMatchState(){
      if(this.getMatchState() == 'In progress'){ // Changed map
        // send 'info' cmd
        // get the current map
        // listen to response (hasInfo) and update the current map
        this.rcon.send('info');
      }
    }

    /**
     * 
     * @param {string} str 
     */
    handlePunishment(str){
      // reports punishments to discord
      if(config.bootstrap.discord){
        this.discordConn.client.channels.cache.get(config.discord.punishment_channel_id).send(str);
      }
    }


    /**
     * 
     * @param {object} kill 
     */
    async handleKill(kill){
      // save kill/death to killfeed and update leaderboard
      if(config.bootstrap.leaderboard){
        await this.Killfeed.saveKill(kill);
      }
    }

    _iniParseInfo(resp){
      const respList = resp.split('\n');

      if(respList.length > 1 && respList[0].match(/^HostName:/)) {
        return { 
            gamemode: respList[3].split(': ')[1],
            map: respList[4].split(': ')[1]
          };
      }
    }

    _iniParsePlayerlist(resp){
      if(resp.match(/,\s(team)\s[0-9]{1,2}/)){
        const playerlist = resp.match(/([A-Z0-9]{14,16})/g);

        return playerlist;  
      }
    }

    _iniParseKillfeed(resp){
      let respList = resp.split(/^Killfeed:\s/);
      const playfabids = resp.match(/([A-Z0-9]{14,16})/g);

      // checks if the message is a killfeed and if it contains two players (not a bot)
      if(respList.length > 1) {

        if(playfabids.length <= 1){
          console.log(`${playfabids} killed a bot 🤖`);
          return;
        }
        let data = {players: []};

        respList[1] = respList[1].split(/.?:\s/);
        let players = respList[1][1].split(' killed ');

        for(let player in players){
          let name = players[player].split(/[A-Z0-9]{14,16}\s/)[1];
          name = name.slice(1, name.length - 1); // removes brackets from name e.g. (plzHelpM3) to plzHelpM3
          let id = players[player].split(' ')[0];
          data.players.push({playfab:id, name:name});
        }

        const response = {
          killer: data.players[0],
          killed: data.players[1],
          created_at: respList[1][0],
        };

        return response;
      }

      return;
    }

    _iniParseMatchState(resp){
      const respList = resp.split(/^MatchState:\s/);

      if(respList.length > 1) return respList[1];
    }
    
    _iniParseChat(resp){
        const respList = resp.split(/^Chat:\s/);
        
      if(respList.length > 1) return respList[1].split(',');
    }

    _iniParsePunishment(resp){
      const respList = resp.split(/^Punishment:\s/);

      if(respList.length > 1) return respList[1].split(',');
    }
    
    _matchPlayfab(string){
      if(string.match(/^[A-Z0-9]{14,16}$/)) return true;

      console.log("Failed to match playfab");
      return false;
    }

    _parseForCommand(message){
      return this.commandWhitelist.findIndex( (command) => message.startsWith(command.parseMatch));
    }

    _parseForChatBlacklist(message){
      return this.chatBlacklist.findIndex( (word) => message.includes(word))
    }

    async _buildRequestAdminCommand(){
      // pings a role within discord (role id specified in config.json)
      const currentTime = new Date().getTime();
      const lastCommand = await this.commandLog.getLastCommand(this.getPlayfab(), '/admin').then(result => {return result;}).catch(err => console.log('error:',err));
      const lastUse = new Date(lastCommand[0]?.created_at ?? null).getTime(); // allows null values to pass the next condition

      // only if requestee's last use is greater than 2 minutes ago
      // && discord enabled in config
      if(currentTime >= lastUse + 120000 && config.bootstrap.discord){
        this.commandLog.saveCommand(this.getPlayfab(), this.getMessage());
        this.discordConn.client.channels.cache.get(config.discord.chat_channel_id).send(`<@&${config.discord.admin_role_id}>, ${this.getName()} requested an admin`);
        return `say ${this.getName()}, an admin request has been sent.`;
      }
      return `writetoconsole requestAdminCommand timeout: ${this.getName()} - ${this.getPlayfab()}`;
    }

    async _buildDiscordCommand(){
      const currentTime = new Date().getTime();
      const lastCommand =  await this.commandLog.getLastCommand(this.getPlayfab(), '/discord').then(result => {return result;}).catch(err => console.log('error:',err));
      const lastUse = new Date(lastCommand[0]?.created_at ?? null).getTime(); // allows null values to pass the next condition

      if(currentTime >= lastUse + 120000){
        this.commandLog.saveCommand(this.getPlayfab(), '/discord');
        return `say ${this.discord}`;
      }
      return `writetoconsole discord timeout: ${this.getPlayfab()}`;
    }

    async _buildCommandList(){
      const currentTime = new Date().getTime();
      const lastCommand = await this.commandLog.getLastCommand(this.getPlayfab(), '/commands').then(result => {return result;}).catch(err => console.log('error:',err));
      const lastUse = new Date(lastCommand[0]?.created_at ?? null).getTime(); // allows null values to pass the next condition

      // checks if the player used the command < 2 minutes ago
      if(currentTime >= lastUse + 120000){
        this.commandLog.saveCommand(this.getPlayfab(), '/commands');

        // filter commands available for the current map & config requirements
        const filteredCommands = this.commandWhitelist.filter( command =>  {

          // checks if command has a config requirement
          // && if requirement is enabled
          if(command.requires && (config.bootstrap[command.requires]) === false) return false; // requirement not enabled

          if(typeof command.mapArgs === 'undefined'){
            return true;
          }

          return (typeof command.mapArgs[this.getMap()] !== 'undefined');

        });

        const parseMatches =  filteredCommands.map( command => {
          if(command.info){
            return `"${command.parseMatch}" - ${command.info}`
          }

          return `"${command.parseMatch}"`;
        });
        
        const commands =  parseMatches.join('\n');

        return `say ${commands}`;
      }

      return `writetoconsole command-list timeout: ${this.getPlayfab()}`;
    }

    async _buildGetLeaderboardCommand(){
      const currentTime = new Date().getTime();
      const lastCommand = await this.commandLog.getLastCommand(this.getPlayfab(), '/leaderboard').then(result => {return result;}).catch(err => console.log('error:',err));
      const lastUse = new Date(lastCommand[0]?.created_at ?? null).getTime(); // allows null values to pass the next condition

      if(currentTime >= lastUse + 60000){
        this.commandLog.saveCommand(this.getPlayfab(), '/leaderboard');
        return `say ${config.leaderboard.url}`;
      }
      return `writetoconsole command-list timeout: ${this.getPlayfab()}`;
    }

    _buildTpTopCommand(){
        const args = this.getMapArgs();
        return `teleportplayer ${this.getPlayfab()} ${args}`;
    }

    _buildTpRockCommand(){
      const args = this.getMapArgs();
      return `teleportplayer ${this.getPlayfab()} ${args}`;
    }

    _buildTpMiddleCommand(){
      const args = this.getMapArgs();
      return `teleportplayer ${this.getPlayfab()} ${args}`;
    }

    _buildMuteForOneDayCommand(){
      return `mute ${this.getPlayfab()} 1440`
    }

    _buildTpMenuCommand(){
      const args = this.getMapArgs();
      return `teleportplayer ${this.getPlayfab()} ${args}`;
    }

    _buildTpPillarCommand(){
      const args = this.getMapArgs();
      return `teleportplayer ${this.getPlayfab()} ${args}`;
    }

    _buildTpCageCommand(){
      const args = this.getMapArgs();
      return `teleportplayer ${this.getPlayfab()} ${args}`;
    }

    _buildTpNetCommand(){
      const args = this.getMapArgs();
      return `teleportplayer ${this.getPlayfab()} ${args}`;
    }

    _buildTpFT10Command(){
      const args = this.getMapArgs();
      return `teleportplayer ${this.getPlayfab()} ${args}`;
    }

    _buildTpFT102Command(){
      const args = this.getMapArgs();
      return `teleportplayer ${this.getPlayfab()} ${args}`;
    }

    _buildTpCartCommand(){
      const args = this.getMapArgs();
      return `teleportplayer ${this.getPlayfab()} ${args}`;
    }

    _buildTpPenCommand(){
      const args = this.getMapArgs();
      return `teleportplayer ${this.getPlayfab()} ${args}`;
    }

    _buildTpStonehengeCommand(){
      const args = this.getMapArgs();
      return `teleportplayer ${this.getPlayfab()} ${args}`;
    }
}

module.exports = MordhauRconController;