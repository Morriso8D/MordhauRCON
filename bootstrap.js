const config = require('./config.json');

/**
 * Bootstrap the application
 * @return configurable setup constraints
 */

let app = [];

if(config.bootstrap.discord) app.push('./foundation/discord');

if(config.bootstrap.command_line) app.push('./foundation/command-line');




module.exports = app;