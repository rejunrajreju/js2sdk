var inquirer = require('inquirer');
var schema = require("../schemas.js");
var service = require("../service.js");

var sectionModelFields = function() {
    inquirer.prompt(schema.Qmain_modelname, function(modelname) {
        inquirer.prompt(schema.Qmain_fieldnumber, function(fieldname) {
            var maxfields = parseInt(fieldname.fieldnumber);
            var totalFields = [];
            var fieldnames = {};
            var fieldtypes = {};
            var fielddefault = {};
            var fieldrequired = {};
            var fieldforsync = {};
            for (var i = 0; i < maxfields; i++) {
                fieldnames = JSON.parse(JSON.stringify(schema.Qmain_fieldname));
                fieldtypes = JSON.parse(JSON.stringify(schema.Qmain_fieldtypes));
                fieldrequired = JSON.parse(JSON.stringify(schema.Qmain_fieldrequired));
                fielddefault = JSON.parse(JSON.stringify(schema.Qmain_fielddefault));
                fieldforsync = JSON.parse(JSON.stringify(schema.Qmain_fieldforsyncoption));
                
                fieldnames.name = 'fieldname' + i;
                fieldtypes.name = 'fieldtype' + i;
                fieldrequired.name = 'fieldrequired' + i;
                fielddefault.name = 'fielddefault' + i;
                fieldforsync.name = 'fieldforsync'+i;
                totalFields.push(fieldnames);
                totalFields.push(fieldtypes);
                totalFields.push(fieldrequired);
                totalFields.push(fielddefault);
                totalFields.push(fieldforsync);
            }
            inquirer.prompt(totalFields, function(consolidated) {
                var remap = service.remapToArray(consolidated);
                service.writeToFile('./models/' + modelname.modelname + '.json', remap);
            })
        });
    });
};

module.exports = {
    sectionModelFields: sectionModelFields()
}