var express     = require("express")
var request     = require("request")
var bodyParser  = require("body-parser")
var upload      = require("express-fileupload")
var path		= require("path")
var app         = express()

var port = process.env.PORT
// var port = process.env.PORT | 1000

app.set("view engine", "ejs")
app.use(upload())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

const {
    Aborter,
    BlockBlobURL,
    ContainerURL,
    ServiceURL,
    SharedKeyCredential,
    StorageURL,
    uploadStreamToBlockBlob,
    uploadFileToBlockBlob
} = require('@azure/storage-blob');

const STORAGE_ACCOUNT_NAME = "daftartugaswebapp";
const ACCOUNT_ACCESS_KEY = "Y3FSkbXqG8dyregKmdc+qwZAncuIdeSghwM/r/F2zzjk6fkk5aSas7sJgeIb+OD0NLh0F1A1Q+LC3qQHntOfTQ==";
// const ONE_MEGABYTE = 1024 * 1024;
// const FOUR_MEGABYTES = 4 * ONE_MEGABYTE;
const ONE_MINUTE = 60 * 1000;

const aborter = Aborter.timeout(30 * ONE_MINUTE);
const containerName = "images";
const credentials = new SharedKeyCredential(STORAGE_ACCOUNT_NAME, ACCOUNT_ACCESS_KEY);
const pipeline = StorageURL.newPipeline(credentials);
const serviceURL = new ServiceURL(`https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`, pipeline);
const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName); 

app.get('/', function (req, res) {		
    showBlobNames(aborter, containerURL).then(function(data){
        // console.log(data)
	    res.render("index", {data: data})
    })    
});

app.post('/upload', function (req, res) {	
    console.log("Uploading file...")
    
    // console.log(req.files);
    if(req.files.upfile){
        var file = req.files.upfile,
        name = file.name,
        type = file.mimetype;
        var uploadpath = __dirname + '/uploads/' + name;
        file.mv(uploadpath,function(err){
            if(err){
                console.log("File Upload Failed",name,err);
                res.send("Error Occured!")
            }
            else {
                console.log("File Uploaded",name);                
                execute(uploadpath)               
                sleep(3000).then(function(){
                    res.redirect("/")
                })                              
            }
        });
    }
    else {
        res.send("No File selected !");
        res.end();
    };
});

app.post('/analyze', function (req, res) {	
    var data = {
        url: req.body.imageurl
    }

    var options = {        
        url: "https://southeastasia.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=Description&language=en",
        headers: {
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": "ce4989b0c43f466595bf22541382c716"
        },        
        body: JSON.stringify(data),
    }

    console.log("Analyzing file... " + req.body.imageurl)  
    
    request.post(options,(err, response, body) => {
        if (err)
            return console.log(err)
            // console.log(JSON.parse(body))
        
        res.render("analyze", {imageurl: req.body.imageurl, caption: JSON.parse(body).description.captions[0].text})
    });
});

function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}

async function execute(filePath) {
    // console.log("Containers:");
    // await showContainerNames(aborter, serviceURL);
    
    console.log(filePath)
    await uploadLocalFile(aborter, containerURL, filePath);
    console.log(`Local file "${filePath}" is uploaded`);
}

async function showBlobNames(aborter, containerURL) {
    let response;
    let marker;

    do {
        response = await containerURL.listBlobFlatSegment(aborter);
        marker = response.marker;
        // console.log(response.segment.blobItems)
        for(let blob of response.segment.blobItems) {
            console.log(` - ${ blob.name }`);
        }
    } while (marker);
    
    return response.segment.blobItems
}

async function showContainerNames(aborter, serviceURL) {

    var response;
    var marker;

    do {
        response = await serviceURL.listContainersSegment(aborter, marker);
        marker = response.marker;
        for(var container of response.containerItems) {
            console.log(` - ${ container.name }`);
        }
    } while (marker);
}

async function uploadLocalFile(aborter, containerURL, filePath) {

    filePath = path.resolve(filePath);

    const fileName = path.basename(filePath);
    const blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, fileName);

    return await uploadFileToBlockBlob(aborter, filePath, blockBlobURL);
}

app.listen(port)
console.log("Server is running on port %d", port);