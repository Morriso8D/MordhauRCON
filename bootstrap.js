const config = require('./config.json');

/**
 * Bootstrap the application
 * @return specified setup constraints
 */

let app = [require('./foundation/rcon')];

if(typeof config.bootstrap.discord !== 'undefined') app.push(require('./foundation/discord'));

if(typeof config.commandLine !== 'undefined') app.push(require('./foundation/command-line'));


return app;