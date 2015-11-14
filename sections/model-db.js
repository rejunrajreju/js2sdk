var inquirer = require('inquirer');
var schema = require("../schemas.js");
var service = require("../service.js");
var G = require("../config.js");

var sectionDB = function(){
  inquirer.prompt([schema.Qmain_dbname,schema.Qmain_dbversion,schema.Qmain_dbsize], function( dbconf ) {
    service.writeToFile('./config/'+G.filenames.db+'.json',dbconf);
  });
};

module.exports = {
  sectionDB:sectionDB()
}