var express = require('express');
var querystring = require('querystring');
var auth = require('http-auth');
var bodyParser = require('body-parser');
var http = require("http");
var assert = require('assert');
var appRoot = require('app-root-path');
var config = require('config');

var basicUsername = config.get('BasicAuth.User');
var basicPassword = config.get('BasicAuth.Password');
var SERVER_MODULES = config.get('ServerModules');

global.appVersion = '0.5'



const PORT=8080; 
var HOST = '127.0.0.1';

app = express();

app.use(bodyParser.json())

server = http.createServer(app).listen(PORT, HOST);

console.log('IoT Server listening on %s:%s', HOST, PORT);

function errorHandler(err, req, res, next) {
  res.writeHead(400, "Bad Request", {'content-type' : 'text/plain'});
  res.end("something wrong");
}

app.use(errorHandler);

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')

var basic = auth.basic({
        realm: "Web."
    }, function (username, password, callback) {
        callback(username === basicUsername && password === basicPassword);
    }
);

SERVER_MODULES.forEach(function(module) { 
 console.log("Installing module "+module);
 var mod = require(appRoot+module);
 var moduleInfo = mod.getModuleInformation();
 var serverEndpoints = moduleInfo.serverEndpoints;
 serverEndpoints.forEach(function(endpoint) {
  console.log("Installing endpoint "+endpoint.requestType+" "+endpoint.endpointURL+" of "+module);
  if (endpoint.requestType==="GET") {
  	app.get(endpoint.endpointURL, auth.connect(basic), endpoint.requestFunction);
  } else if (endpoint.requestType==="POST") {
	app.post(endpoint.endpointURL, auth.connect(basic), endpoint.requestFunction);
  }
 });
});

app.get('/',  auth.connect(basic), function (req, res) {
  res.render('index',
  { title : 'Home',
    menus : ['<a href="/heating.html">Heating Data</a>','<a href="/status">Status</a>','<a href="/monitoring">Monitoring</a>'],
    version : global.appVersion
  });
});




