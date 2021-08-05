const CommandLog = require("../../models/command-log");
const Discord = require('../services/discord');
const Killfeed = require('../../models/rcon-killfeed');
const Leaderboard = require('../../models/leaderboard');

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
    this.discordConn = Discord.singleton();
    this.rcon = rcon;
    this.Killfeed = new Killfeed();
    this.leaderboard = new Leaderboard();
  }

  discord = 'https://discord.gg/GBZJmrR';

  commandWhitelist = [
      {
        parseMatch: '/admin',
        exeMethod: 'buildRequestAdminCommand',
        info: 'Request an admin'
      },
      {
        parseMatch: '/commands',
        exeMethod: 'buildCommandList',
        info: 'List of available commands'
      },
      {
        parseMatch: '/leaderboard',
        exeMethod: 'buildGetLeaderboardCommand',
        info: 'Link to our leaderboard'
      },
      {
        parseMatch: '/discord',
        exeMethod: 'buildDiscordCommand',
        info: 'Link to our discord'
      },
      {
        parseMatch: '/tp rock',
        exeMethod: 'buildTpRockCommand',
        mapArgs: {
          'Contraband':'x=-13200,y=7100,z=400',
        },
        info: 'Teleport' 
      },
      {
        parseMatch: '/tp top',
        exeMethod: 'buildTpTopCommand',
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
        exeMethod: 'buildTpMiddleCommand',
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
        exeMethod: 'buildTpMenuCommand',
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
        exeMethod: 'buildTpPillarCommand',
        mapArgs: {
          'Contraband':'x=400,y=0,z=2000'
        },
        info: 'Teleport'
      },
      {
        parseMatch: '/tp cage',
        exeMethod: 'buildTpCageCommand',
        mapArgs: {
          'Highlands': 'x=10264,y=-11758,z=-3450'
        },
        info: 'Teleport'
      },
      {
        parseMatch: '/tp cart',
        exeMethod: 'buildTpCartCommand',
        mapArgs: {
          'Highlands': 'x=8391,y=-15256,z=-3360'
        },
        info: 'Teleport'
      },
      {
        parseMatch: '/tp stonehenge',
        exeMethod: 'buildTpStonehengeCommand',
        mapArgs: {
          'Highlands': 'x=-32940,y=-45509,z=-2378'
        },
        info: 'Teleport'
      },
      {
        parseMatch: '/tp pen',
        exeMethod: 'buildTpPenCommand',
        mapArgs: {
          'Highlands': 'x=8610,y=-16307,z=-3359'
        },
        info: 'Teleport'
      },
      {
        parseMatch: '/tp net',
        exeMethod: 'buildTpNetCommand',
        mapArgs: {
          'Contraband': 'x=-500,y=-700,z=2300'
        },
        info: 'Teleport'
      },
      {
        parseMatch: '/tp arena2',
        exeMethod: 'buildTpFT10Command',
        mapArgs: {
          'Contraband': 'x=3200,y=3500,z=4000'
        },
        info: 'Teleport'
      },
      {
        parseMatch: '/tp arena',
        exeMethod: 'buildTpFT102Command',
        mapArgs: {
          'Contraband': 'x=3200, y=-3500,z=4000',
          'Moshpit': 'x=-10000,y=5000,z=6400',
        },
        info: 'Teleport'
      }
  ];

    chatBlacklist = [
      'nigger',
      'Nigger',
      'niggers',
      'Niggers',
      'nigers',
      'Nigers',
      'N!gger',
      'Nigger3r',
      'nigga',
      'Nigga',
    ];

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
      if(typeof this.commandWhitelist[this.respData.commandIndex].exeMethod === 'string'){ // runs String exeMethods
        return this[this.commandWhitelist[this.respData.commandIndex].exeMethod]();
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
        command: this.buildMuteForOneDayCommand(),
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
    
      const respChunk = this.iniParseChat(resp);
      if(typeof respChunk !== 'undefined' && this.matchPlayfab(respChunk[0])) {

            this.respData.playfab = respChunk[0];
            this.respData.name = respChunk[1];
            this.respData.message = respChunk[2].match(/^\s\((.*)\)\s(.*)/)[2];

          this.respData.commandIndex = this.parseForCommand(this.respData.message);

          if(this.respData.commandIndex === -1) return false; // No command found

          return true;
      }
    }

    hasKillfeed(resp){
      const data = this.iniParseKillfeed(resp);

      if (typeof data !== 'undefined'){
        this.respData.killfeed = data;
        return true;
      }
      return false;
    }

    hasMessage(resp){
      
      const respChunk = this.iniParseChat(resp);

      if(typeof respChunk !== 'undefined') return true;
      return false;
    }

    hasBlacklistedWord(resp){

      const respChunk = this.iniParseChat(resp);

      if(typeof respChunk !== 'undefined' && this.matchPlayfab(respChunk[0])) {
        this.respData.playfab = respChunk[0];
        this.respData.name = respChunk[1];
        this.respData.message = respChunk[2].match(/^\s\((.*)\)\s(.*)/)[2];

        if(this.parseForChatBlacklist(this.respData.message) === -1) return false;

        return true;
      }
    }

    hasMatchState(resp){

      const respChunk = this.iniParseMatchState(resp);

      if(typeof respChunk === 'undefined') return false; // response isn't MatchState
      
      this.respData.matchState = respChunk;

      return true; // response is MatchState
    }

    hasInfo(resp){

      const respChunk = this.iniParseInfo(resp);

      if(typeof respChunk === 'undefined') return false; // response isn't Info

      this.respData.gamemode = respChunk.gamemode;
      this.respData.map = respChunk.map;

      return true; // response is Info
    }

    hasPlayerlist(resp){
      const respChunk = this.iniParsePlayerlist(resp);

      if(typeof respChunk !== 'undefined'){

        this.respData.playerlist = respChunk;

        return true;
      }
    }

    hasPunishment(resp){
      const respChunk = this.iniParsePunishment(resp);

      if(typeof respChunk === 'undefined') return false;
      return true;
    }

    handleMessage(str){
      this.discordConn.client.channels.cache.get('839952559749201920').send(str.replace(/[^a-zA-Z0-9()\?\:]/ig,' '));
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
      // reports punishment to discord
      this.discordConn.client.channels.cache.get('842075143136084008').send(str);
    }


    /**
     * 
     * @param {object} kill 
     */
    async handleKill(kill){
      await this.Killfeed.saveKill(kill);
    }

    iniParseInfo(resp){
      const respList = resp.split('\n');

      if(respList.length > 1 && respList[0].match(/^HostName:/)) {
        return { 
            gamemode: respList[3].split(': ')[1],
            map: respList[4].split(': ')[1]
          };
      }
    }

    iniParsePlayerlist(resp){
      if(resp.match(/,\s(team)\s[0-9]{1,2}/)){
        const playerlist = resp.match(/([A-Z0-9]{14,16})/g);

        return playerlist;  
      }
    }

    iniParseKillfeed(resp){
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

    iniParseMatchState(resp){
      const respList = resp.split(/^MatchState:\s/);

      if(respList.length > 1) return respList[1];
    }
    
    iniParseChat(resp){
        const respList = resp.split(/^Chat:\s/);
        
      if(respList.length > 1) return respList[1].split(',');
    }

    iniParsePunishment(resp){
      const respList = resp.split(/^Punishment:\s/);

      if(respList.length > 1) return respList[1].split(',');
    }
    
    matchPlayfab(string){
      if(string.match(/^[A-Z0-9]{14,16}$/)) return true;

      console.log("Failed to match playfab");
      return false;
    }

    parseForCommand(message){
      return this.commandWhitelist.findIndex( (command) => message.startsWith(command.parseMatch));
    }

    parseForChatBlacklist(message){
      return this.chatBlacklist.findIndex( (word) => message.includes(word))
    }

    async buildRequestAdminCommand(){
      const currentTime = new Date().getTime();
      const lastCommand = await this.commandLog.getLastCommand(this.getPlayfab(), '/admin').then(result => {return result;}).catch(err => console.log('error:',err));
      const lastUse = new Date(lastCommand[0]?.created_at ?? null).getTime(); // allows null values to pass the next condition

      if(currentTime >= lastUse + 120000){
        this.commandLog.saveCommand(this.getPlayfab(), this.getMessage());
        this.discordConn.client.channels.cache.get('839952559749201920').send(`<@&770321070959493170>, ${this.getName()} requested an admin`);
        return `say ${this.getName()}, an admin request has been sent.`;
      }
      return `writetoconsole requestAdminCommand timeout: ${this.getName()} - ${this.getPlayfab()}`;
    }

    async buildDiscordCommand(){
      const currentTime = new Date().getTime();
      const lastCommand =  await this.commandLog.getLastCommand(this.getPlayfab(), '/discord').then(result => {return result;}).catch(err => console.log('error:',err));
      const lastUse = new Date(lastCommand[0]?.created_at ?? null).getTime(); // allows null values to pass the next condition

      if(currentTime >= lastUse + 120000){
        this.commandLog.saveCommand(this.getPlayfab(), '/discord');
        return `say ${this.discord}`;
      }
      return `writetoconsole discord timeout: ${this.getPlayfab()}`;
    }

    async buildCommandList(){
      const currentTime = new Date().getTime();
      const lastCommand = await this.commandLog.getLastCommand(this.getPlayfab(), '/commands').then(result => {return result;}).catch(err => console.log('error:',err));
      const lastUse = new Date(lastCommand[0]?.created_at ?? null).getTime(); // allows null values to pass the next condition

      if(currentTime >= lastUse + 120000){
        this.commandLog.saveCommand(this.getPlayfab(), '/commands');

        const filteredCommands = this.commandWhitelist.filter( command =>  {
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

    async buildGetLeaderboardCommand(){
      const currentTime = new Date().getTime();
      const lastCommand = await this.commandLog.getLastCommand(this.getPlayfab(), '/leaderboard').then(result => {return result;}).catch(err => console.log('error:',err));
      const lastUse = new Date(lastCommand[0]?.created_at ?? null).getTime(); // allows null values to pass the next condition

      if(currentTime >= lastUse + 60000){
        this.commandLog.saveCommand(this.getPlayfab(), '/leaderboard');
        return `say https://cronchduels.com/server-one/leaderboard`;
      }
      return `writetoconsole command-list timeout: ${this.getPlayfab()}`;
    }

    buildTpTopCommand(){
        const args = this.getMapArgs();
        return `teleportplayer ${this.getPlayfab()} ${args}`;
    }

    buildTpRockCommand(){
      const args = this.getMapArgs();
      return `teleportplayer ${this.getPlayfab()} ${args}`;
    }

    buildTpMiddleCommand(){
      const args = this.getMapArgs();
      return `teleportplayer ${this.getPlayfab()} ${args}`;
    }

    buildMuteForOneDayCommand(){
      return `mute ${this.getPlayfab()} 1440`
    }

    buildTpMenuCommand(){
      const args = this.getMapArgs();
      return `teleportplayer ${this.getPlayfab()} ${args}`;
    }

    buildTpPillarCommand(){
      const args = this.getMapArgs();
      return `teleportplayer ${this.getPlayfab()} ${args}`;
    }

    buildTpCageCommand(){
      const args = this.getMapArgs();
      return `teleportplayer ${this.getPlayfab()} ${args}`;
    }

    buildTpNetCommand(){
      const args = this.getMapArgs();
      return `teleportplayer ${this.getPlayfab()} ${args}`;
    }

    buildTpFT10Command(){
      const args = this.getMapArgs();
      return `teleportplayer ${this.getPlayfab()} ${args}`;
    }

    buildTpFT102Command(){
      const args = this.getMapArgs();
      return `teleportplayer ${this.getPlayfab()} ${args}`;
    }

    buildTpCartCommand(){
      const args = this.getMapArgs();
      return `teleportplayer ${this.getPlayfab()} ${args}`;
    }

    buildTpPenCommand(){
      const args = this.getMapArgs();
      return `teleportplayer ${this.getPlayfab()} ${args}`;
    }

    buildTpStonehengeCommand(){
      const args = this.getMapArgs();
      return `teleportplayer ${this.getPlayfab()} ${args}`;
    }
}

module.exports = MordhauRconController;