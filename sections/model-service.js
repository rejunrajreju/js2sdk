var inquirer = require('inquirer');
var schema = require("../schemas.js");
var service = require("../service.js");
var fs = require("fs");
var chalk = require("chalk");

var sectionModelService = function(){
  var filteredfilenames = [];
  fs.readdir('./models', function(err,filenames){
    if(err || filenames.length<1){
      console.log(chalk.red('Need models before creating service. js2sdk create model'));
      process.exit(1);
    }
    filteredfilenames = service.filterJSONFile(filenames);
  });

  inquirer.prompt([schema.Qmain_servicename, schema.Qmain_servicepersistresponse, schema.Qmain_servicetrigger, schema.Qmain_servicemethod, schema.Qmain_servicerequired,schema.Qmain_servicesendviaheader], function(servicebasicconf) {
    inquirer.prompt(schema.Qmain_servicemodelnumber, function( fieldname ) {
      var maxmodels = parseInt(fieldname.numberofmodels);
      var totalFields = [];
      var servicemodels = {};
      var servicemodelsmapname = {};
      var servicecomparekey = {};
      for(var i=0; i<maxmodels; i++){
        servicemodels = JSON.parse(JSON.stringify(schema.Qmain_servicemodels));
        servicemodelsmapname = JSON.parse(JSON.stringify(schema.Qmain_servicemodelresponsepoint));
        servicecomparekey = JSON.parse(JSON.stringify(schema.Qmain_servicecomparekey));
        servicemodels.name = 'servicemodels'+i;
        servicemodels.choices = filteredfilenames;
        totalFields.push(servicemodels); 
        servicemodelsmapname.name = 'servicemodelsmapname'+i;
        totalFields.push(servicemodelsmapname);
        servicecomparekey.name = 'servicecomparekey'+i;
        totalFields.push(servicecomparekey);  
      }
      inquirer.prompt(totalFields, function(consolidated) {
        var remap = service.remapToArray(consolidated);
        servicebasicconf.models = remap;
        servicebasicconf.exceptionalfields = "";
        servicebasicconf.datefieldsendnameifany = "";
        servicebasicconf.postsyncmodels = [];  // request models
        servicebasicconf.postsyncdatefield = ""; // send last cal date
        servicebasicconf.includeforsynccall = false; // true if needs execution on call
        service.bindServices(servicebasicconf);
        service.writeToFile('./services/'+servicebasicconf.servicename+'.json',servicebasicconf);
      })
    });
  });
};

module.exports = {
  sectionModelService:sectionModelService()
}