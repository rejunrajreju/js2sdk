var fs = require("fs");
var Q = require('Q');
var concat = require('concat-files');
var uglify = require('uglify-js');
var path = require('path');
var jsonfile = require('jsonfile');
var G = require("./config.js");
var chalk = require('chalk');

var writeToFile = function(filename, data) {
    var deferred = Q.defer();
    jsonfile.writeFile(filename, data, {
        spaces: 2
    }, function(err) {
        if (err) {
            deferred.reject(err);
        }
        deferred.resolve("done");
    })
    return deferred.promise;
};

var executeCreate = function(createargs) {
    if (createargs === 'model') {
        require('./sections/model-field.js');
    }
    if (createargs === 'service') {
        require('./sections/model-service.js');
    }
};

var init = function() {
    require('./sections/model-init.js');
};

var syncinit = function(){
    var syncobj = {
      "servicename": "_sync",
      "servicepersistresponse": false,
      "servicetrigger": "http://127.0.0.1:3000/api/v1.0/deals",
      "servicemethod": "POST",
      "servicerequired": true,
      "authisheader": false,
      "models": [
        {
          "servicemodels": "_SYNC",
          "servicemodelsmapname": "response",
          "servicecomparekey": "idnostore"
        },
        
      ],
      "exceptionalfields": "",
      "datefieldsendnameifany": "",
      "postsyncmodels": [],
      "postsyncdatefield":"",
      "includeforsynccall":false
    };

    writeToFile(G.loc.services+'/'+G.filenames.sync+'.json', syncobj);
};

var executeConfig = function(createargs) {
    if (createargs === 'db') {
        require('./sections/model-db.js');
    }
    if (createargs === 'initdb') {
        dbConfigurator();
    }
};

var executeBind = function(createargs) {
    if (createargs === 'cache') {
        try {
            fs.writeFile(G.loc.servicebindings, '', function(err) {
                if (!err) {
                    addserviceBind();
                }
            });

        } catch (e) {}
    }
};

var addserviceBind = function() {
    var deferred = Q.defer();
    try {
        var filteredfilenames;
        var thisbindings = '';
        dirListng(G.loc.services).then(function(filteredfilenames) {
            var counterservice = 0;
            filteredfilenames.forEach(function(data) {
                jsonfile.readFile(G.loc.services + '/' + data + '.json', function(err, serviceobj) {
                    if (!err) {
                        thisbindings = thisbindings + G.prefix.fnc + '.' + data + " = " + JSON.stringify(serviceobj) + ";";
                        thisbindings = thisbindings + "exports." + G.prefix.main+ '.' + data + " = " + G.prefix.main + '.' + "binder.bind(" + G.prefix.fnc + '.' + data + ");";
                        if (counterservice == filteredfilenames.length - 1) {
                            try {
                                fs.appendFile(G.loc.servicebindings, thisbindings, function(err) {
                                    if (!err) {
                                        deferred.resolve("done");
                                    }
                                });
                            } catch (e) {
                                console.log("ERR");
                            }
                        }
                    }
                    counterservice++;
                });
            });
        });
    } catch (e) {}
    return deferred.promise;
};

var createStrecture = function() {
    var loginmodel = {
        "id": "id",
        "ttl": "ttl",
        "created": "created",
        "userid": "userid",
        "role": "role",
        "Auth": "access_token"
    };

    fs.exists('./models', function(exist) {
        if (!exist)
            fs.mkdir('./models');
    });
    fs.exists('./config', function(exist) {
        if (!exist)
            fs.mkdir('./config');
    });
    fs.exists('./services', function(exist) {
        if (!exist)
            fs.mkdir('./services');
    });
    fs.exists(__dirname +'/workspace', function(exist) {
        if (!exist)
            fs.mkdir(__dirname +'/workspace');
    });
    fs.exists(G.loc.servicebindings, function(exist) {
        if (!exist)
            fs.writeFile(G.loc.servicebindings, '');
    });
    fs.exists(G.loc.modelbindings, function(exist) {
        if (!exist)
            fs.writeFile(G.loc.modelbindings, '');
    });
    fs.exists(__dirname +G.loc.sdkname, function(exist) {
        if (!exist)
            fs.writeFile(__dirname +G.loc.sdkname, '');
    });
    writeToFile('./models/_LOGIN.json', loginmodel);

    var readme = "Library used: https://github.com/stackp/promisejs, Thanks for the team for creating such a small library deal with promise. Please refer http://www.js2sdk.com for documentation ";
    writeToFile('./Readme.txt', readme);
    

};

var makeSDK = function() { console.log(__dirname );
    try {
        prebuild().then(function() {
            concat([
                __dirname + G.loc.promise,
                __dirname + G.loc.templateopen,
                __dirname + G.loc.templateconstants,
                G.loc.modelbindings,
                __dirname + G.loc.templateservice,
                __dirname + G.loc.templatesave,
                G.loc.servicebindings,
                __dirname + G.loc.templateclose
            ], __dirname +G.loc.sdkname, function() {
                var result = uglify.minify([__dirname +G.loc.sdkname]);
                fs.writeFileSync(G.loc.sdkminified, result.code);
                console.log('SDK Generated');
            });
        });

    } catch (e) {
        console.log('ERROR LOG');
    }
};

var dirListng = function(loc) {
    var deferred = Q.defer();
    fs.readdir(loc, function(err, filenames) {
        if (err || filenames.length < 1) {
            console.log(chalk.red('Need models before creating service. js2sdk create model'));
            process.exit(1);
        }
        filteredfilenames = filterJSONFile(filenames);
        deferred.resolve(filteredfilenames);
    });
    return deferred.promise;
}

var bindconfig = function() {
    var deferred = Q.defer();
    jsonfile.readFile(G.loc.config + '/' + G.filenames.init + '.json', function(err, modelobj) {
        var bindtemplatemodel = "exports." + G.prefix.main + '.' + G.prefix.model+"."+ "_initproject =" + JSON.stringify(modelobj) + ";";
        fs.appendFile(G.loc.modelbindings, bindtemplatemodel, function(err) {
            if (!err) {
                deferred.resolve("done");
            }
        });

    })
    return deferred.promise;
};

var binddb = function(){
    var deferred = Q.defer();
    jsonfile.readFile(G.loc.config + '/' + G.filenames.db + '.json', function(err, modelobj) {
        var bindtemplatemodel = "exports." + G.prefix.main + '.' + G.prefix.model+"."+ "_db =" + JSON.stringify(modelobj) + ";";
        fs.appendFile(G.loc.modelbindings, bindtemplatemodel, function(err) {
            if (!err) {
                deferred.resolve("done");
            }
        });

    })
    return deferred.promise;
};

var syncBind = function(){
    var deferred = Q.defer();
     jsonfile.readFile(G.loc.services + '/' + G.filenames.sync + '.json', function(err, modelobj) {
        var bindtemplatesync = "var "+G.prefix.sync+ " =" + JSON.stringify(modelobj) + ";";
        bindtemplatesync = bindtemplatesync+ "var "+G.prefix.syninternalfn+" =" + G.prefix.main + '.' + "binder.bind(" + G.prefix.sync + ");";
        fs.appendFile(G.loc.servicebindings, bindtemplatesync, function(err) {
            if (!err) {
                deferred.resolve("done");
            }
        });

    })

    return deferred.promise;
};

var prebuild = function() {
    var deferred = Q.defer();
    var bindtemplatemodel = '';
    var modelcounter = 0;
    fs.writeFile(G.loc.modelbindings, '');
    dirListng(G.loc.models).then(function(modelnames) {
        modelnames.forEach(function(selmodels) {
            jsonfile.readFile(G.loc.models + '/' + selmodels + '.json', function(err, modelobj) {
                bindtemplatemodel = bindtemplatemodel + "exports." + G.prefix.main + '.' + G.prefix.model+"."+ selmodels + "=" + JSON.stringify(modelobj) + ";";
                bindtemplatemodel = bindtemplatemodel + "exports." + G.prefix.main + '.' + G.prefix.modelinstance+"."+ selmodels + "= new modelInstance('" + G.prefix.main + '.' + G.prefix.model+"."+ selmodels + "');";
                if (modelcounter === modelnames.length - 1) {
                    fs.appendFile(G.loc.modelbindings, bindtemplatemodel, function(err) {
                        if (!err) {
                            bindconfig().then(function() {
                                binddb().then(function(){
                                    syncBind().then(function(){
                                        deferred.resolve("done");
                                    });
                                });
                            });
                        }
                    });
                }
                modelcounter++;
            })
        });
    });
    return deferred.promise;
};

var dbConfigurator = function() {
    try {
        jsonfile.readFile('./config/' + G.filenames.db + '.json', function(err, dbconf) {
            if (!err) {
                if (dbconf.dbtype === 'Websql') {
                    websqlInitialization(dbconf);
                }
            }

        });
    } catch (e) {
        console.log('ERROR LOG');
    }
};

var bindServices = function(data) {
    try {
        var bindtemplate =  G.prefix.fnc + '.' + data.servicename + " = " + JSON.stringify(data) + ";";
        bindtemplate = bindtemplate+ "exports." + G.prefix.main + '.' + data.servicename + " = " + G.prefix.main + '.' + "binder.bind(" + G.prefix.fnc + '.' + data.servicename + ");";
        fs.appendFile(G.loc.servicebindings, bindtemplate, function(err) {
            if (err) throw err;
        });
    } catch (e) {
        console.log("ERR");
    }

};

var websqlInitialization = function(dbconf) {
    console.log('suppoted');
    console.log(dbconf);

};

var filterJSONFile = function(arrayofnames) {
    var filterednames = [];
    for (i = 0; i < arrayofnames.length; i++) {
        if (arrayofnames[i].indexOf('.json') > 0) {
            filterednames.push(arrayofnames[i].substring(0, arrayofnames[i].length - 5));
        }
    }
    return filterednames;
};

var remapToArray = function(obj) {
    var objkeys = Object.keys(obj);
    var arrayoffields = [];
    var fieldlist = {};
    var cursor = 0;
    for (var i = 0; i < objkeys.length; i++) {
        if (objkeys[i].substr(-1) != cursor) {
            cursor++;
            arrayoffields.push(fieldlist);
            fieldlist = {};
        }
        if (objkeys[i].substr(-1) == cursor) {
            fieldlist[objkeys[i].substr(0, objkeys[i].length - 1)] = obj[objkeys[i]];
        }
    }
    arrayoffields.push(fieldlist);
    return arrayoffields;
};

module.exports = {
    writeToFile: writeToFile,
    executeCreate: executeCreate,
    makeSDK: makeSDK,
    createStrecture: createStrecture,
    remapToArray: remapToArray,
    executeConfig: executeConfig,
    dbConfigurator: dbConfigurator,
    filterJSONFile: filterJSONFile,
    bindServices: bindServices,
    executeBind: executeBind,
    init: init,
    syncinit:syncinit
}