var fs = require('fs');
var path = require('path');
var express = require('express');
var querystring = require('querystring');
var auth = require('http-auth');
var bodyParser = require('body-parser');
var http = require("http");
var assert = require('assert');
var dateFormat = require('dateformat');
var moment = require('moment-timezone');
var fs = require('fs');
var appRoot = require('app-root-path');
var getHeizungData = require(appRoot+"/heatingFromDropbox.js");
var config = require('config');

var basicUsername = config.get('BasicAuth.User');
var basicPassword = config.get('BasicAuth.Password');
var timezone = config.get('Timezone');

var serverStart = moment.tz(new Date(), timezone);

var status = {
	lastUpdate: "never",
        data: {state:"ready"},
        serverStart: serverStart.format('DD.MM.YYYY HH:mm'),
        appVersion: "0.3"
}

const PORT=8080; 
var HOST = '127.0.0.1';

app = express();

app.use(bodyParser.json())

server = http.createServer(app).listen(PORT, HOST);

console.log('HTTPS Server listening on %s:%s', HOST, PORT);

function errorHandler(err, req, res, next) {
  res.writeHead(400, "Bad Request", {'content-type' : 'text/plain'});
  res.end("something wrong");
}

app.use(errorHandler);

var basic = auth.basic({
        realm: "Web."
    }, function (username, password, callback) {
        callback(username === basicUsername && password === basicPassword);
    }
);

app.get('/', auth.connect(basic),  function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(status, null, 3), encoding='utf8');
});

app.get('/heating.html', auth.connect(basic), function(req,res){
      res.sendFile(path.join(__dirname + '/heating.html'));
});

app.get('/data.csv', auth.connect(basic),  function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    getHeizungData(8,function(content) {
	 res.end(content, encoding='utf8');
    });
});

app.post('/update', auth.connect(basic), function(req, res) {
    if (req) {
    	var now = new Date();
        var nowMom = moment.tz(now, );
 	status.lastUpdate = nowMom.format('DD.MM.YYYY HH:mm:ss');
	if (req.body) {
                var merged = {};
                for(key in status.data)
                       merged[key] = status.data[key];
                for(key in req.body)
                       merged[key] = req.body[key];
                       merged[key].lastUpdate = nowMom.format('DD.MM.YYYY HH:mm:ss');
		status.data=merged;
	}
   }
   res.sendStatus(200);
});



