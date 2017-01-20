var moment = require('moment-timezone');
var dateFormat = require('dateformat');
var config = require('config');
var timezone = config.get('Timezone');

var serverStart = moment.tz(new Date(), timezone);
var status = {
	lastUpdate: "never",
        data: {state:"ready"},
        serverStart: serverStart.format('DD.MM.YYYY HH:mm'),
        appVersion: global.appVersion
}

function updateStatusHandler(req, res) {
    if (req) {
    	var now = new Date();
        var nowMom = moment.tz(now, timezone);
 	status.lastUpdate = nowMom.format('DD.MM.YYYY HH:mm:ss');
	if (req.body) {
                var merged = {};
                for(key in status.data) {
                       merged[key] = status.data[key];
                }
                for(key in req.body) {
                       merged[key] = req.body[key];
                       merged[key].lastUpdate = nowMom.format('DD.MM.YYYY HH:mm:ss');
                }
		status.data=merged;
	}
   }
   res.sendStatus(200);
}

function getStatusHandler(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(status, null, 3), encoding='utf8');
}

getModuleInformation = function () {
  return { configBlock : "Status",
           serverEndpoints :
           [{ endpointURL : "/update",
              requestType : "POST",
              requestFunction : updateStatusHandler },
            { endpointURL : "/status",
              requestType : "GET",
              requestFunction : getStatusHandler }
           ]
         };
}

module.exports = {
 getModuleInformation:getModuleInformation
};
