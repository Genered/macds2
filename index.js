var express     = require("express")
var bodyParser  = require("body-parser")
var sql 		= require("mssql");
var app         = express()
var port = process.env.PORT
// var port = process.env.PORT | 1000

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

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: false}))

app.get('/', function (req, res) {
	var todos = [{"task" : "Minum", "deadline" : "13.00"},
				 {"task" : "Makan", "deadline" : "12.00"}];   				 
	sql.connect(dbConfig, (err) => {		
		if(err)
			console.log(err);
		else {
			var request = new sql.Request();
			request.query("select * from todos", (err, record) => {
				if(err)
					console.log(err);
				else {
					res.render("index", {todos: record.recordset});
					sql.close();
					console.log(record.recordset);	
				}	
			});		
		}
	});		 
});

app.post('/', function (req, res) {				
	sql.connect(dbConfig, (err) => {		
		if(err)
			console.log(err);
		else {
			var request = new sql.Request();
			var query = "insert into todos (task, deadline) values (" + 
						"'" + req.body.task + "', " +
						"'" + req.body.deadline + "')";
			request.query(query, (err, record) => {
				if(err)
					console.log(err);
				else{					
					res.redirect("/");	
					sql.close();		
					console.log(record.recordset);
				}
			});			
		}					
	});				
});

app.listen(port)
console.log("Server is running on port %d", port);