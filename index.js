var http = require("http");
var url = require("url");
var fs  = require("fs");
var qs = require("querystring");
var sql = require("mssql");
var port = process.env.PORT;

var server = http.createServer((request, response) => {
    console.log(__dirname);
    // console.log(request.method);
    // console.log(req.url);
    // console.log(url.parse(req.url));

    var pathName = url.parse(request.url).pathname
    // console.log('pathname' + pathName);

    if(request.method == "GET")
        showPage(response, pathName);
    else{
        switch(pathName){
            case "/":
                // console.log("Processing...");   
                parseData(request, response, function(){
                    // console.log(request.post); 
                    response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
                    response.end();
                });                
                break;
        }
    }
});

function parseData(request, response, callback){
    var body = "";    

    request.on('data', function (data) {
        body += data;        
        // console.log("Processing body...");  
        // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB, too much data
        if (body.length > 1e6) { 
            // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
            response.writeHead(413, {'Content-Type': 'text/plain'}).end();
            request.connection.destroy();
        }

    });

    request.on('end', function () {
        request.post = qs.parse(body);      
        // console.log("Parsing the body...");    
        callback();        
    });        
}

function showPage(response, pathName){
    switch(pathName){
        case "/":            
            fs.readFile("./views/index.html", (err, data) => {
                if(err){
                    response.writeHead(404);
                    response.end("Can\'t find the file.");                
                    // console.log(err);
                }
                else {
                    response.writeHead(200, {"Content-Type" : "text/html"});
                    response.write(data);
                }
            });                        
        break;
        default:
            response.writeHead(404);
            // response.write('Page not found.');
            response.end("Can\'t find the page you looking for. " + pathName);
            break;
    }    
}

server.listen(port);
console.log("Server is running on port %d", port);

// // Create a configuration object for our Azure SQL connection parameters
// var dbConfig = {
//  server: "daftartugaswebapp.database.windows.net", // Use your SQL server name
//  database: "daftartugas", // Database to connect to
//  user: "genered", // Use your username
//  password: "Burliku1", // Use your password
//  port: 1433,
//  // Since we're on Windows Azure, we need to set the following options
//  options: {
//        encrypt: true
//    }
// };

// sql.connect(dbConfig).then(conn => {
//     // console.log(conn);
//     console.log("Connected!");
// })
// .catch(e => {
//     console.error('connection error', e.message, e.stack)
// });