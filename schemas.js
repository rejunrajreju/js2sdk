var chalk = require('chalk');
var Qmain_modelname = {
    type: 'input',
    name: 'modelname',
    message: '[MODEL NAME]',
    validate: function(input) {
        var done = this.async();
        if (!input.length) {
            done(chalk.red("Name is mandatory"));
            return;
        }else{
            if(/[<>%\$_.-@!%^&*()_+|#]/.test(input)){
                done(chalk.red("Name should only contain alphabets and numbers"));
                return;
            }   
        }
        done(true);
    }
};

var Qmain_fieldname = {
    type: 'input',
    name: 'fieldname',
    message: '[FIELD NAME]'
};

var Qmain_fieldnumber = {
    type: 'input',
    name: 'fieldnumber',
    message: '[Number of Fields]'
};

var Qmain_fieldrequired = {
    type: 'confirm',
    name: 'fieldrequired',
    message: '[NEED TO SAVE ON GET CALL]'
};

var Qmain_fieldforsyncoption = {
    type: 'confirm',
    name: 'fieldforsyncoption',
    message: '[FIELD INCLUDE FOR SYNC]'
};

var Qmain_fielddefault = {
    type: 'input',
    name: 'fielddefault',
    message: '[Default]'
};

var Qmain_fieldtypes = {
    type: 'list',
    name: 'fieldtype',
    message: '[TYPE]',
    choices: ['String', 'Integer']
};

var Qmain_dbname = {
    type: 'input',
    name: 'dbname',
    message: '[DB Name]',
    validate: function(input) {
        var done = this.async();
        if (!input.length) {
            done(chalk.red("Name is mandatory"));
            return;
        }else{
            if(/[<>%\$_.-@!%^&*()_+|#]/.test(input)){
                done(chalk.red("Name should only contain alphabets and numbers"));
                return;
            }   
        }
        done(true);
    }
};

var Qmain_dbsize = {
    type: 'input',
    name: 'dbsize',
    default: '5',
    message: '[DB Size]'
};

var Qmain_dbversion = {
    type: 'input',
    name: 'dbversion',
    default: '1.0.0',
    message: '[DB VERSION]'
};

var Qmain_dbType = {
    type: 'list',
    name: 'dbtype',
    default: 'Websql',
    message: '[DB TYPE]',
    choices: ['Websql']
};

var Qmain_servicename = {
    type: 'input',
    name: 'servicename',
    message: '[SERVICE NAME]',
    validate: function(input) {
        var done = this.async();
        if (!input.length) {
            done(chalk.red("Name is madatory"));
            return;
        }else{
            if(/[<>%\$_.-@!%^&*()_+|]/.test(input)){
                done(chalk.red("Name should only contain alphabets and numbers"));
                return;
            }   
        }
        done(true);
    }
};

var Qmain_servicepersistrequest = {
    type: 'confirm',
    name: 'servicepersistrequest',
    message: '[REQUEST PERSISTENCE]'
};

var Qmain_servicepersistresponse = {
    type: 'confirm',
    name: 'servicepersistresponse',
    message: '[RESPONSE PERSISTENCE]'
};

var Qmain_servicetrigger = {
    type: 'input',
    name: 'servicetrigger',
    default: 'http://js2sdk.com',
    message: '[SERVICE TRIGGER URL]'
};

var Qmain_servicemethod = {
    type: 'list',
    name: 'servicemethod',
    message: '[METHOD]',
    choices: ['GET', 'POST', 'PUT', 'DELETE']
};

var Qmain_servicecomparekey = {
    type: 'input',
    name: 'servicecomparekey',
    message: '[MODEL COMPARE KEY (COMMA SEPARATED)]'
};

var Qmain_servicebefore = {
    type: 'input',
    name: 'servicebefore',
    message: '[SERVICE HOOK BEFORE]'
};

var Qmain_serviceafter = {
    type: 'input',
    name: 'serviceafter',
    message: '[SERVICE HOOK AFTER]'
};

var Qmain_servicerequired = {
    type: 'confirm',
    name: 'servicerequired',
    message: '[Auth REQUIRED]'
};

var Qmain_servicemodelnumber = {
    type: 'input',
    name: 'numberofmodels',
    message: '[NUMBER OF RESPONSE MODELS]'
};

var Qmain_servicemodels = {
    type: 'list',
    name: 'servicemodels',
    message: '[RESPONSE MODELS]',
    choices: ['SELECT']
};

var Qmain_servicemodelresponsepoint = {
    type: 'input',
    name: 'servicemodelresponsepoint',
    default: 'response',
    message: '[SERVICE RESPONSE MAP NAME]'
};

var Qmain_projectname = {
    type: 'input',
    name: 'projectname',
    message: '[ProjectName]',
    validate: function(input) {
        var done = this.async();
        if (!input.length) {
            done(chalk.red("Name is mandatory"));
            return;
        }else{
            if(/[<>%\$_.-@!%^&*()_+|#]/.test(input)){
                done(chalk.red("Name should only contain alphabets and numbers"));
                return;
            }   
        }
        done(true);
    }
};

var Qmain_projectauthor = {
    type: 'input',
    name: 'projectauthor',
    message: '[AUTHOR]'
};

var Qmain_servicesendviaheader = {
    type: 'confirm',
    name: 'authisheader',
    message: '[SEND AUTH VIA HEADER]'
};

var Qmain_projectiswebsql = {
    type: 'confirm',
    name: 'iswebsql',
    message: '[USE WEBSQL]'
};

var Qmain_projectsyncauthreq = {
    type: 'confirm',
    name: 'servicerequired',
    message: '[AUTH REQUIRED FOR SYNC METHOD]'
};

var Qmain_projectsyncurl = {
    type: 'input',
    name: 'projectsyncurl',
    default: 'http://js2sdk.com',
    message: '[SYNC URL]'
};

var Qmain_projectsyncauthviaheader = {
    type: 'confirm',
    name: 'authisheader',
    message: '[SYNC AUTH SEND VIA HEADER]'
};

var Qmain_projectdebug = {
    type: 'confirm',
    name: 'serviceisdebug',
    message: '[DEBUG MODE]'
};
module.exports = {
    Qmain_modelname: Qmain_modelname,
    Qmain_fieldname: Qmain_fieldname,
    Qmain_fieldnumber: Qmain_fieldnumber,
    Qmain_fieldtypes: Qmain_fieldtypes,
    Qmain_fieldrequired: Qmain_fieldrequired,
    Qmain_dbname: Qmain_dbname,
    Qmain_dbsize: Qmain_dbsize,
    Qmain_dbversion: Qmain_dbversion,
    Qmain_dbType: Qmain_dbType,
    Qmain_fielddefault: Qmain_fielddefault,
    Qmain_servicename: Qmain_servicename,
    Qmain_servicepersistrequest: Qmain_servicepersistrequest,
    Qmain_servicepersistresponse: Qmain_servicepersistresponse,
    Qmain_servicetrigger: Qmain_servicetrigger,
    Qmain_servicemethod: Qmain_servicemethod,
    Qmain_servicerequired: Qmain_servicerequired,
    Qmain_servicemodels: Qmain_servicemodels,
    Qmain_servicemodelnumber: Qmain_servicemodelnumber,
    Qmain_servicebefore: Qmain_servicebefore,
    Qmain_serviceafter: Qmain_serviceafter,
    Qmain_projectname:Qmain_projectname,
    Qmain_projectauthor:Qmain_projectauthor,
    Qmain_servicesendviaheader:Qmain_servicesendviaheader,
    Qmain_projectiswebsql:Qmain_projectiswebsql,
    Qmain_servicemodelresponsepoint:Qmain_servicemodelresponsepoint,
    Qmain_servicecomparekey:Qmain_servicecomparekey,
    Qmain_fieldforsyncoption:Qmain_fieldforsyncoption,
    Qmain_projectsyncauthreq:Qmain_projectsyncauthreq,
    Qmain_projectsyncauthviaheader:Qmain_projectsyncauthviaheader,
    Qmain_projectsyncurl:Qmain_projectsyncurl,
    Qmain_projectdebug:Qmain_projectdebug


}