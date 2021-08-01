const CommandLog = require("../../models/command-log");
const Discord = require('../services/discord');

class MordhauRconController{

  constructor(commands = [], chatBlacklist = []){
    
    if(commands.length > 0){
      this.commandWhitelist = this.commandWhitelist.concat(commands);
    }

    if(chatBlacklist.length > 0){
      this.chatBlacklist = this.chatBlacklist.concat(chatBlacklist);
    }

    this.commandLog = new CommandLog();
    this.discordConn = Discord.singleton();
  }

  discord = 'https://discord.gg/GBZJmrR';

  commandWhitelist = [
      {
        parseMatch: '/admin',
        exeMethod: 'buildRequestAdminCommand'
      },
      {
        parseMatch: '/commands',
        exeMethod: 'buildCommandList'
      },
      {
        parseMatch: '/leaderboard',
        exeMethod: 'buildGetLeaderboardCommand'
      },
      {
        parseMatch: '/discord',
        exeMethod: 'buildDiscordCommand',
      },
      {
        parseMatch: '/tp rock',
        exeMethod: 'buildTpRockCommand',
        mapArgs: {
          'Contraband':'x=-13200,y=7100,z=400',
        } 
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
        } 
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
        } 
      },
      {
        parseMatch: '/tp menu',
        exeMethod: 'buildTpMenuCommand',
        mapArgs: {
          'Contraband':'x=-5359,y=327,z=-606',
          'The Pit':'x=-5500,y=-2700,z=1000',
          'Highlands':'x=5567,y=-19298,z=-3077',
          'Truce':'x=2786,y=2007,z=134',
        }
      },
      {
        parseMatch: '/tp pillar',
        exeMethod: 'buildTpPillarCommand',
        mapArgs: {
          'Contraband':'x=400,y=0,z=2000'
        }
      },
      {
        parseMatch: '/tp cage',
        exeMethod: 'buildTpCageCommand',
        mapArgs: {
          'Highlands': 'x=10264,y=-11758,z=-3450'
        }
      },
      {
        parseMatch: '/tp cart',
        exeMethod: 'buildTpCartCommand',
        mapArgs: {
          'Highlands': 'x=8391,y=-15256,z=-3360'
        }
      },
      {
        parseMatch: '/tp stonehenge',
        exeMethod: 'buildTpStonehengeCommand',
        mapArgs: {
          'Highlands': 'x=-32940,y=-45509,z=-2378'
        }
      },
      {
        parseMatch: '/tp pen',
        exeMethod: 'buildTpPenCommand',
        mapArgs: {
          'Highlands': 'x=8610,y=-16307,z=-3359'
        }
      },
      {
        parseMatch: '/tp net',
        exeMethod: 'buildTpNetCommand',
        mapArgs: {
          'Contraband': 'x=-500,y=-700,z=2300'
        }
      },
      {
        parseMatch: '/tp arena2',
        exeMethod: 'buildTpFT10Command',
        mapArgs: {
          'Contraband': 'x=3200,y=3500,z=4000'
        }
      },
      {
        parseMatch: '/tp arena',
        exeMethod: 'buildTpFT102Command',
        mapArgs: {
          'Contraband': 'x=3200, y=-3500,z=4000',
          'Moshpit': 'x=-10000,y=5000,z=6400',
        }
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

    hasPunishment(resp){
      const respChunk = this.iniParsePunishment(resp);

      if(typeof respChunk === 'undefined') return false;
      return true;
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

    iniParseKillfeed(resp){
      let respList = resp.split(/^Killfeed:\s/);

      if(respList.length > 1) {
        let data = {players: []};

        respList[1] = respList[1].split(/.?:\s/);
        let players = respList[1][1].split(' killed ');

        for(let player in players){
          let name = players[player].split(/[A-Z0-9]{14,16}\s/)[1];
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

      if(currentTime >= lastUse + 60000){
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

      if(currentTime >= lastUse + 60000){
        this.commandLog.saveCommand(this.getPlayfab(), '/discord');
        return `say ${this.discord}`;
      }
      return `writetoconsole discord timeout: ${this.getPlayfab()}`;
    }

    async buildCommandList(){
      const currentTime = new Date().getTime();
      const lastCommand = await this.commandLog.getLastCommand(this.getPlayfab(), '/commands').then(result => {return result;}).catch(err => console.log('error:',err));
      const lastUse = new Date(lastCommand[0]?.created_at ?? null).getTime(); // allows null values to pass the next condition

      if(currentTime >= lastUse + 60000){
        this.commandLog.saveCommand(this.getPlayfab(), '/commands');
        // commands = this.commandWhitelist.filter( command =>  command.mapArgs[this.respData.map] ?? false );
        // console.log(commands);
        return `Oops something went wrong... Visit ${this.discord} for a full list of commands`;
      }
      return `writetoconsole command-list timeout: ${this.getPlayfab()}`;
    }

    async buildGetLeaderboardCommand(){
      const currentTime = new Date().getTime();
      const lastCommand = await this.commandLog.getLastCommand(this.getPlayfab(), '/leaderboard').then(result => {return result;}).catch(err => console.log('error:',err));
      const lastUse = new Date(lastCommand[0]?.created_at ?? null).getTime(); // allows null values to pass the next condition

      if(currentTime >= lastUse + 60000){
        this.commandLog.saveCommand(this.getPlayfab(), '/leaderboard');
        return `https://cronchduels.com/server-one/leaderboard`;
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