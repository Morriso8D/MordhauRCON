# MordhauRCON

## Table of Contents
* [About](#about)
* [Features](#features)
* [Requirements](#requirements)
* [Setup](#setup)
* [In-game Commands](#in-game-commands)
* [CLI Commands](#cli-commands)
* [API](#api)

## About
MordhauRCON is a Node.js bot that allows you to easily manage and customise your Mordhau server via RCON.

## Features
* Discord integration for control and reporting (reports chat and punishments)
* leaderboard with 1v1 stats (MariaDB)
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
5. open [create_db.sql](/setup/create_db.sql) and run the SQL to create the tables (required if leaderboard is enabled)
6. navigate to the repo's directory (e.g. ``cd /Users/<your-name>/code/MordhauRCON``) and run ``npm install``
7. start the bot ``node server.js``

## In-game Commands

## CLI Commands

## API
