var inquirer = require('inquirer');
var schema = require("../schemas.js");
var service = require("../service.js");
var G = require("../config.js");

var sectionInit = function(){
  inquirer.prompt([schema.Qmain_projectname,schema.Qmain_projectauthor,schema.Qmain_projectiswebsql,schema.Qmain_projectdebug], function( projectdetails ) {
    service.writeToFile('./config/'+G.filenames.init+'.json',projectdetails);
  });
};

module.exports = {
  sectionInit:sectionInit()
}