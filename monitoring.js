var exec = require('child_process').exec;
var cmdLogins = 'cat /var/log/auth.log | grep  "of user"';
var cmdOpenPort = 'netstat -tulpen';
var cmdTop = 'top -b -n1';


function getCmdResponse(cmd, callback) {
 exec(cmd, function(error, stdout, stderr) {
  callback(stdout);
 });
}

function getMonitoringRequestHandler(req, res) {
   res.setHeader('Content-Type', 'application/json');
   var data = {}
   getCmdResponse(cmdLogins, function(logins) { 
        data["logins"]=logins.split("\n");
        getCmdResponse(cmdOpenPort, function(ports) { 
        	data["ports"]=ports.split("\n");
		getCmdResponse(cmdTop, function(tops) { 
			data["top"]=tops.split("\n");
    			res.end(JSON.stringify(data, null, 3), encoding='utf8');
		});
	});
   });
}

function getOpenPortsRequestHandler(req, res) {
   getOpenPorts( function(logins) {
    	res.setHeader('Content-Type', 'application/json');
    	res.end(JSON.stringify({"openPorts":logins.split("\n")}, null, 3), encoding='utf8');
   });
}

getMonitoringServerEndpoints = function () {
  return { "/monitoring": getMonitoringRequestHandler }
}

module.exports = getMonitoringServerEndpoints;
