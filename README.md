# MordhauRCON

## Table of contents
* [About] (#about)
* [Features] (#features)
* [Requirements] (#requirements)
* [Setup] (#setup)
* [API] (#api)

## About
MordhauRCON is a Node.js bot that allows you to easily manage and customise your Mordhau server via RCON.

## Features
* custom in-game commands (full list below)
* Automod - mute players for using blacklisted words (configurable in config.json)
* discord control and reporting (chatlog and punishments)
* leaderboard with 1v1 stats (MySQL)
* run from client machine or server with CLI control
* configurable setup
* rich set of API anchors -- offering a range of handy functions to setup your own bespoke commands and/or behaviour.

## Requirements
* Node version: >14.17.4
* MariaDB: >10.4.10
* run from client machine (Windows, Mac) or Linux/Windows server
* discord bot token (optional)

## Setup
1. Clone or fork the repository.
2. Rename ``.env.example`` to ``.env`` (in the root directory) and then edit and save your connection settings.
3. Open [config.json](/config.json) and configure the bots setup. E.g. - if discord isn't required, set the "bootstrap" section to false ```"discord": false```
4. Navigate to the repo's directory (e.g. ``cd /Users/<your-name>/code/MordhauRCON``) and then run ``node server.js`` to start the bot.
