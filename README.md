# MordhauRCON

## Table of contents
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
* custom [in-game commands](#in-game-commands)
* Automod - mute players for using blacklisted words (configurable in [config.json](/config.json))
* discord control and reporting (chatlog and punishments)
* leaderboard with 1v1 stats (MySQL)
* run from either client machine or server with CLI control
* configurable setup
* rich set of API anchors -- offering a range of handy functions to setup your own bespoke commands and/or behaviour

## Requirements
* Node version: >14.17.4
* MariaDB: >10.4.10
* run from client machine (Windows, Mac) or Linux/Windows server
* discord bot token (optional)

## Setup
1. Clone or fork the repository ``git clone https://github.com/Morriso8D/MordhauRCON.git``
2. Rename [.env.example](/.env.example) to ``.env`` (in the root directory) and then edit and save your connection settings
3. Open [config.json](/config.json) and configure the bots setup. E.g. - if discord isn't required, set "discord" to false
```json 
"bootstrap":{
    "discord": false,
    "command_line": true,
    "leaderboard": true
},
```
5. Navigate to the repo's directory (e.g. ``cd /Users/<your-name>/code/MordhauRCON``) and then run ``node server.js`` to start the bot

## In-game Commands

## CLI Commands

## API
