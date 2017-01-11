var Dropbox = require('dropbox');
var appRoot = require('app-root-path');
var fs = require('fs');

var DROPBOX_TOKEN = fs.readFileSync(appRoot+'/dropbox_token.txt','utf8').trim();

getHeatingData = function (numberOfFiles, callback){

	var dbx = new Dropbox({ accessToken: DROPBOX_TOKEN });
	dbx.filesListFolder({path: '/heatinglog'})
	  .then(function(response) {
	    var files = [];
	    var start = 0;
	    if (response.entries.length > numberOfFiles) {
		start = response.entries.length - numberOfFiles;
	    }
	    for (var i = start; i < response.entries.length; i++) {
		files.push({name: response.entries[i].name, path: response.entries[i].path_lower});
	    } 
	    var responseCount = 0;
	    for (var i = 0; i < files.length; i++) {
	     dbx.filesDownload({ path: files[i].path })
	      .then(function (data) {
		var buff = new Buffer(data.fileBinary);
		for (var i=0; i<files.length; i++) {
			if (data.name == files[i].name) {
				files[i].content = buff.toString('utf8');
			}
		}
		responseCount++;
		if (responseCount == files.length) {
		   //last answer received 
		   var allfields = {};
		   var structuredContentAll = [];
		   for (var i=0; i<files.length; i++) {
                   	var schema = files[i].content.substr(0, files[i].content.indexOf('\n'));
			var fields = schema.split("\t");
			for (var k=1; k<fields.length; k++) {
				//add as dictionary
				allfields[fields[k]]=fields[k];
			}
         		var content = files[i].content.substr(files[i].content.indexOf('\n')+1);
			structuredContentAll = structuredContentAll.concat(content.split("\n")
			    .filter(function(line) {
                                //filter incomplete lines
				var parts = line.split("\t");
				if (parts.length!=fields.length) {
					return false;
				}
				return true;
			    }).map(function(line) {
    				//structuring lines
				var structuredParts = {};
                                var parts = line.split("\t");
				for (var j=1;j<parts.length;j++) {
					structuredParts[fields[j]]=parts[j];
				}
				var res = {
      					timestamp: parts[0],
      					values: structuredParts
    				};
				return res;
			}));
		   }
		   //sort by timestamp
		   structuredContentAll.sort(function(a, b) {
    		   	var timeA = a.timestamp;
		   	var timeB = b.timestamp;
    		   	return (timeA < timeB) ? -1 : (timeA > timeB) ? 1 : 0;	
		   });
		   //generate first line
		   var csvContent = "Timestamp";
		   for (var key in allfields) {
  			if (allfields.hasOwnProperty(key)) {
				csvContent = csvContent +"\t" +key;
 			}
 		   }
		   csvContent = csvContent +"\n";
		   for (var i=0; i<structuredContentAll.length; i++) {
		   	csvContent = csvContent + structuredContentAll[i].timestamp;
			for (var key in allfields) {
				var value = structuredContentAll[i].values[key];
				if (value == undefined) {
					csvContent = csvContent +"\t";
				} else {
					csvContent = csvContent +"\t" + value;
				}
			}
		        csvContent = csvContent +"\n";
		   }
		   callback(csvContent);
		}
	      });
	    }
	  })
	  .catch(function(error) {
	    console.log(error);
	  });

};

module.exports = getHeatingData;
