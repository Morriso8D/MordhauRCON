# MordhauRCON

## Table of Contents
* [About](#about)
* [Features](#features)
* [Requirements](#requirements)
* [Setup](#setup)
* [In-game Commands](#in-game-commands)
* [Discord Commands](#discord-commands)
* [API](#api)

## About
MordhauRCON is a Node.js bot that allows you to easily manage and customise your Mordhau gaming server via RCON.

## Features
* Discord integration for control and reporting (reports chat and punishments)
* leaderboard with 1v1 stats (MariaDB) - [conchduels.com/leaderboard](https://cronchduels.com/server-one/leaderboard)
* custom [in-game commands](#in-game-commands)
* API anchors -- offers a range of handy functions to setup your own bespoke commands and/or behaviour
* send RCON commands via CLI (optional)
* Automod - mute players for using blacklisted words (configurable in [config.json](/config.json))
* run from either client machine or server
* configurable setup

## Requirements
* Node version: >14.17.4
* MariaDB: >10.4.10
* run from client machine (Windows, Mac) or server (Linux, Windows)
* Discord bot token (optional)

## Setup
1. clone or fork the repo ``git clone https://github.com/Morriso8D/MordhauRCON.git``
2. rename [.env.example](/.env.example) to ``.env`` (in the root directory) and then edit and save your connection settings
3. open [config.json](/config.json) and configure the bots setup. E.g. - if discord isn't required, set "discord" to false
```json 
"bootstrap":{
    "discord": false,
    "command_line": true,
    "leaderboard": true
},
```
5. open [create_db.sql](/setup/create_db.sql) and run the SQL to create the database (only required if leaderboard is enabled)
6. navigate to the repo's directory (e.g. ``cd /Users/<your-name>/code/MordhauRCON``) and run ``npm install``
7. start the bot ``node server.js``

## In-game Commands
| Commands             | What it does                                                                 | Dependencies |
| -------------------- |:----------------------------------------------------------------------------:|:------------:|
| ```/admin```         | Pings an admin in Discord for support (includes 2 minute timeout)            |(1) "admin_role_id" must be set to a Discord role ID in [config.json](/config.json). (2) Database setup for command logging
| ```/commands```      | Lists all available commands for the current map (includes 2 minute timeout) | Database setup for command logging
|```/leaderboard```    | Outputs a link to the leaderboard                                            | (1) "leaderboard" set to true in [config.json](/config.json) & "leaderboard" "url" mut be set. (2) Database setup for command logging
|```/discord```        | Outputs a link to the Discord (includes 2 minute timeout                     | (1) Discord "link" must be set in [config.json](/config.json). (2) Database setup for command logging
|```/tp rock```        | Teleports player (Contraband only)                                           |
|```/tp top```         | Teleports player to the sky box                                              |
|```/tp middle```      | Teleports player to the middle of the map                                    |
|```/tp menu```        | Teleports player to the select screen                                        |
|```/tp pillar```      | Teleports player (Contraband only)                                           |
|```/tp cage```        | Teleports player (Highlands only)                                            |
|```/tp cart```        | Teleports player (Highlands only)                                            |
|```/tp stonehenge```  | Teleports player (Highlands only)                                            |
|```/tp pen```         | Teleports player (Highlands only)                                            |
|```/tp net```         | Teleports player (Contraband only)                                           |
|```/tp arena```       | Teleports player (Contraband and Moshpit)                                    |
|```/tp arena2```      | Teleports player (Contraband only)                                           |

## Discord Commands
| Commands                                              | What it does                                                                      |
| ------------------------------------------------------|:---------------------------------------------------------------------------------:|
|```!say <message>```                                   | Send a message to the server                                                      |
|```!playerlist```                                      | Returns players online                                                            |
|```!mutelist```                                        | Returns a list of muted players                                                   |
|```!adminlist```                                       | Returns a list of admins                                                          |
|```!banlist```                                         | Returns a list of banned players                                                  |
|```!kick <playfabid> <reason>```                       | Kick a player from the server                                                     |
|```!teleportplayer x=<x>,y=<y>,z=<z>```                | Teleport a player to the specified coordinates                                    |
|```!killplayer <playfabid>```                          | Kill a player on command                                                          |
|```!info```                                            | Returns server info (current map etc...)                                          |  
|```!stats```                                           | Returns performance stats                                                         |
|```!renameplayer <playfabid> <new name>```             | Rename a player                                                                   |
|```!addbots <number>```                                | Add bots to the server                                                            |
|```!removebots <number>```                             | Remove bots from the server                                                       |
|```!ban <playfabid> <duration> <reason>```             | Ban a player (set duration to 0 for perma ban)                                    |
|```!unban <playfabid>```                               | Unban a player                                                                    |
|```!mute <playfabid> <duration>```                     | Mute a player (set duration to 0 for perma mute)                                  |
|```!unmute <playfabid>```                              | Unmute a player                                                                   |
|```!help```                                            | List all available RCON commands                                                  |
|```!addadmin <playfabid>```                            | Give a player admin privilege                                                     |
|```!removeadmin <playfabid>```                         | Remove admin privilege from a player                                              |
|```!scoreboard```                                      | Output a scoreboard                                                               |
|```!changelevel <map>```                               | Change the current map                                                            |

## API
