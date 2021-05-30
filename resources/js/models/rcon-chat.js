const mysql = require('mysql');
const date = require('date-and-time');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cronch'
});
 
connection.connect();

// connection.query('SELECT 1 + 1 AS solution', (error,results,fields) => {
//     if(error) throw error;
//     console.log('The solution is: ' + results[0].solution);
// });

// connection.query('INSERT INTO rcon_chat')
// connection.end();
const now = new Date(); 
const chat = {playfab_id:'2653203C1FE7F188', name:'plzHelpM3', message: 'looks like it should be highest tbh', created_at: date.format(now, 'YYYY-MM-DD HH:mm:ss')};

connection.query('INSERT INTO rcon_chat SET ?', chat, (error, result, field) => {
    if(error) throw error;
    console.log(result);
});

connection.query('SELECT * FROM rcon_chat', (error, result, field) => {
    if(error) throw error;
    console.log(result);
})

connection.end();

module.exports;