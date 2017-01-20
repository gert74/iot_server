var exec = require('child_process').exec;
var d3 = require('d3-queue');
var config = require('config');
var cmds = config.get('Monitoring.Commands');

//callback is important for d3.queue
function getCmdResponse(cmd, id, data, callback) {
  exec(cmd, function(error, stdout, stderr) {
   data[id]=stdout.split("\n");
   callback(null);
  });
}

function getMonitoringRequestHandler(req, res) {
   res.setHeader('Content-Type', 'application/json');
   var data = {};
   var q = d3.queue();
   for (var i = 0; i < cmds.length; ++i) {
     var cmd = cmds[i];
     q.defer(getCmdResponse, cmd.request, cmd.id, data);
   }
   q.await(function(error) {
      if (error) throw error;
      res.end(JSON.stringify(data, null, 3), encoding='utf8');
   });
}

getModuleInformation = function () {
  return { serverEndpoints :
           [{ endpointURL : "/monitoring",
              requestType : "GET",
              requestFunction : getMonitoringRequestHandler }]
         };
}

module.exports = {
 getModuleInformation:getModuleInformation
};
