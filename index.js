var http = require("http");
var url = require("url");
var fs  = require("fs");
var sql = require("mssql");
var port = process.env.PORT || 1000

var server = http.createServer((req, res) => {
    console.log(req.url);
    console.log(url.parse(req.url));

    var pathName = url.parse(req.url).pathname
    console.log('pathname' + pathName);
    showPage(res, pathName);
});

function showPage(response, pathName){
    switch(pathName){
        case "/":
            fs.readFile("./views/index.html", (err, data) => {
                if(err){
                    response.writeHead(404);
                    response.write('Page not found.');
                    console.log(err);
                }
                else {
                    response.writeHead(200, {"Content-Type" : "text/html"});
                    response.write(data);
                }
            });                        
        break;
        default:
            response.writeHead(404);
            response.write('Page not found.');
            response.end();
            break;
    }    
}

server.listen(port);
console.log("Server is running on port %d", port);

// Create a configuration object for our Azure SQL connection parameters
var dbConfig = {
 server: "zavier-test.database.windows.net", // Use your SQL server name
 database: "AdventureWorks", // Database to connect to
 user: "<your username>", // Use your username
 password: "<your password>", // Use your password
 port: 1433,
 // Since we're on Windows Azure, we need to set the following options
 options: {
       encrypt: true
   }
};

// This function connects to a SQL server, executes a SELECT statement,
// and displays the results in the console.
function getCustomers() {
 // Create connection instance
 var conn = new sql.Connection(dbConfig);

 conn.connect()
 // Successfull connection
 .then(function () {

   // Create request instance, passing in connection instance
   var req = new sql.Request(conn);

   // Call mssql's query method passing in params
   req.query("SELECT * FROM [SalesLT].[Customer]")
   .then(function (recordset) {
     console.log(recordset);
     conn.close();
   })
   // Handle sql statement execution errors
   .catch(function (err) {
     console.log(err);
     conn.close();
   })

 })
 // Handle connection errors
 .catch(function (err) {
   console.log(err);
   conn.close();
 });
}


getCustomers();