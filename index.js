var express     = require("express")
var bodyParser  = require("body-parser")
var sql 		= require("mssql");
var app         = express()
var port = process.env.PORT
// var port = process.env.PORT | 1000

// Create a configuration object for our Azure SQL connection parameters
var dbConfig = {
    server: "daftartugaswebapp.database.windows.net", 
    database: "daftartugas", 
    user: "genered", 
    password: "Burliku1", 
    port: 1433,    
    options: {
		encrypt: true
    }
}

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: false}))

app.get('/', function (req, res) {
	// var todos = [{"task" : "Minum", "deadline" : "13.00"},
	// 			 {"task" : "Makan", "deadline" : "12.00"}];   		
			 
	sql.connect(dbConfig, (err) => {		
		if(err)
			console.log(err);
		else {
			var request = new sql.Request();
			request.query("select * from todo", (err, record) => {
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
			var date = new Date().toISOString().split('T')[0];	
			// console.log(date);		
			var request = new sql.Request();
			var query = "insert into todo (task, deadline, addedDate) values (" + 
						"'" + req.body.task + "', " +
						"'" + req.body.deadline + "', " +
						"'" + date + "')";
			// console.log(query);
			request.query(query, (err, record) => {
				if(err)
					console.log(err);
				else{					
					res.redirect("/");	
					sql.close();		
					// console.log(record.recordset);
				}
			});			
		}					
	});				
});

app.listen(port)
console.log("Server is running on port %d", port);