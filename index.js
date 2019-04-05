var express     = require("express")
var bodyParser  = require("body-parser")
var sql 		= require("mssql");
var app         = express()

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: false}))

// var url = require("url");
// var fs  = require("fs");
// var qs = require("querystring");

// var port = process.env.PORT;
var port = process.env.PORT | 1000

// Create a configuration object for our Azure SQL connection parameters
var dbConfig = {
    server: "daftartugaswebapp.database.windows.net", // Use your SQL server name
    database: "daftartugas", // Database to connect to
    user: "genered", // Use your username
    password: "Burliku1", // Use your password
    port: 1433,
    // Since we're on Windows Azure, we need to set the following options
    options: {
          encrypt: true
      }
   }

app.get('/', function (req, res) {
    res.render("index")
});

app.post('/', function (req, res) {
	sql.connect(dbConfig, function (err) {    
		if (err) 
			console.log(err);
		else {
			res.send("Connected!");
			// create Request object
			// var request = new sql.Request()
			
			// // query to the database and get the records
			// request.query('select * from Student', function (err, recordset) {			
			// 	if (err) console.log(err)
			// 		// send records as a response
			// 		res.send(recordset)				
			// });
		}
    });
});

// server.listen(port);
app.listen(port)
console.log("Server is running on port %d", port);