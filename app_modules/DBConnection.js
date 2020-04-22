var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : process.env.DBHOST,
    user     : process.env.DBUSER,
    password : process.env.DBPWD,
    database : process.env.DBNAME
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = connection;