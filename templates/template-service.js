exports._JS2SDK_.binder = function(data, fn) {
    if (arguments.length < 2) {
        cb(this, data);
    }
    if (arguments.length === 2 && typeof fn === "function") {
        try {
            fn(this, data)(this);
        } catch (e) {}
    }
};

exports._getSession = function() {
    return JSON.parse(localStorage.getItem(prefix.main + initmod.projectname));
};

exports._JS2SDK_.init = function() {
    var p = new promise.Promise();
    initconfig = getModelbyName('_initproject');
    var dbmod = getModelbyName('_db');
    inmemory.access = JSON.parse(localStorage.getItem(prefix.main + initconfig.projectname));
    try {
        if (initconfig.iswebsql && openDatabase) {
            dbhandler = openDatabase(dbmod.dbname, dbmod.dbversion, initconfig.projectname, dbmod.dbsize * 1024 * 1024);
            createtables().then(function() {
                p.done(null, inmemory);
            });
        } else if (!initmod.iswebsql) {
            try {
                dbhandler = window.sqlitePlugin.openDatabase({
                    name: dbmod.dbname + ".db"
                });
                createtables().then(function() {
                    p.done(null, inmemory);
                });

            } catch (e) {
                p.done(errorcodes.dbopen, inmemory);
            }
        }
    } catch (e) {
        p.done(errorcodes.dbopen, inmemory);
    }
    return p;
};

exports._JS2SDK_.logout = function() {
    localStorage.clear()
    inmemory = {};
    headers = {};
};

var getModelbyName = function(modelname) {
    return exports[prefix.main][prefix.model][modelname];
};

var createtables = function() {
    var p = new promise.Promise();
    var tables = exports[prefix.main][prefix.model];
    var tablenames = Object.keys(tables);
    var querypart1 = '';
    var querypart2 = '';
    var counter = 0;
    dbforsdk();
    dbhandler.transaction(function(tx) {
        tablenames.forEach(function(tablename) {
            if (tablename.indexOf('_') < 0) {
                querypart1 = "CREATE TABLE IF NOT EXISTS " + tablename + "(";
                querypart2 = '';
                getModelbyName(tablename).forEach(function(tabledetails) {
                    querypart2 = querypart2 + tabledetails.fieldname + ',';
                });
                querypart2 = querypart2 + "dtetime,_sync default 'UNATTEND')";
                tx.executeSql(querypart1 + querypart2);
            }
            if (counter === tablenames.length - 1) {
                p.done(null, "done");
            }
            counter++;
        });
    });
    return p;
};

exports._JS2SDK_.setHeaders = function(headerkey, headerval) {
    try {
        var login = getModelbyName('_LOGIN');
        headers[login.Auth] = inmemory.access.id;
        headers['Accept'] = "application/json";
        if (typeof headerkey !== "undefined" && typeof headerval !== "undefined") {
            headers[headerkey] = headerval;
        }
    } catch (e) {
        if (initconfig.serviceisdebug) console.log(errorcodes.sessionerror);
    }
};

var dbforsdk = function() {
    dbhandler.transaction(function(tx) {
        tx.executeSql("CREATE TABLE IF NOT EXISTS js2dk_servicetime (servicename,dtetime)");
    });
};

var addtime = function(servicename, dtetime) {
    var servicenames = [];
    var sendargs = [];
    dbhandler.transaction(function(tx) {
        servicenames.push(servicename);
        tx.executeSql("SELECT * from js2dk_servicetime WHERE servicename=?", servicenames, function(tx, result) {
            sendargs = [];
            if (result.rows.length < 1) {
                sendargs.push(servicename);
                sendargs.push(dtetime);
                tx.executeSql("INSERT INTO js2dk_servicetime (servicename,dtetime) VALUES (?,?)", sendargs);
            } else {
                sendargs.push(servicename);
                sendargs.push(dtetime);
                sendargs.push(servicename);
                tx.executeSql("UPDATE js2dk_servicetime SET servicename=? , dtetime=? WHERE servicename=?", sendargs);
            }
        });
    });
};

var headeronMethods = function(context, data) {
    var p = new promise.Promise();
    if (context.servicerequired) {
        if (context.authisheader) {
            _JS2SDK_.setHeaders({});
            p.done(null, data);
        } else {
            var login = getModelbyName('_LOGIN');
            if (context.servicemethod === 'POST' && context.servicetrigger.indexOf(login.Auth) < 0) {
                context.servicetrigger = context.servicetrigger + "?" + login.Auth + "=" + inmemory.access.id;
                p.done(null, data);
            } else if (context.servicemethod === 'GET') {
                try {
                    var tempdata = JSON.parse(JSON.stringify(data));
                    tempdata[login.Auth] = inmemory.access.id;
                    p.done(null, tempdata);
                } catch (e) {
                    p.done(errorcodes.sessionerror, data);
                }
            } else {
                p.done(null, data);
            }
        }
    } else {
        p.done(null, data);
    }
    return p;
};

var adddatewithService = function(context, data) {
    var p = new promise.Promise();
    if (context.postsyncdatefield.length) {
        dbhandler.transaction(function(tx) {
            tx.executeSql("SELECT * FROM js2dk_servicetime WHERE servicename ='" + context.servicename + "'", [], function(txr, result) {
                if (result.rows.length) {
                    data[context.postsyncdatefield] = result.rows.item(0).dtetime;
                    p.done(data);

                } else {
                    p.done(data);
                }
            });
        });
    } else {
        p.done(data);
    }
    return p;
};

var beforecb = function(context, data) {
    var p = new promise.Promise();
    adddatewithService(context, data).then(function(data) {
        headeronMethods(context, data).then(function(err, data) {
            if (context.models[0].servicemodels === '_LOGIN') {
                p.done(null, data, function(response) {
                    var responsemainobj = JSON.parse(response);
                    var loginmodel = getModelbyName('_LOGIN');
                    var responseobj = {};
                    responseobj.id = responsemainobj[loginmodel.id];
                    responseobj.ttl = responsemainobj[loginmodel.ttl];
                    responseobj.created = responsemainobj[loginmodel.created];
                    responseobj.userid = responsemainobj[loginmodel.userid];
                    responseobj.role = responsemainobj[loginmodel.role];
                    responseobj.header = responsemainobj[loginmodel.header];
                    inmemory.access = JSON.parse(JSON.stringify(responseobj));
                    localStorage.setItem(prefix.main + getModelbyName('_initproject').projectname, JSON.stringify(responseobj));
                });
            } else {
                p.done(null, data);
            }
        });
    });

    return p;
};



exports.cb = function(context, data, cbfn) {
    data = (typeof data === "undefined" ? {} : data);
    beforecb(context, data).then(function(err, data, respfn) {
        this['promise'][context.servicemethod.toLowerCase()](context.servicetrigger, data, headers).then(function(error, response, xhr) {
            if (error) {
                if (arguments.length == 3) {
                    serviceafter(error, context, response).then(function(err, alterdata, exceptionldata) {
                        var exceptionldata = typeof exceptionldata === "undefined" ? {} : exceptionldata;
                        try {
                            if (context.servicepersistresponse) {
                                cbfn(err, exceptionldata, xhr);
                            } else {
                                cbfn(err, alterdata, xhr);
                            }

                        } catch (e) {}

                    });
                }
            }
            if (xhr.status === 200) {
                changepushToDone(context, data,response);
            }
            if (typeof respfn === "function") {
                respfn(response);
            }
            if (arguments.length == 3 && typeof cbfn === "function") {
                serviceafter(error, context, response).then(function(err, alterdata, exceptionldata) {
                    try {
                        var exceptionldata = typeof exceptionldata === "undefined" ? {} : exceptionldata;
                        if (context.servicepersistresponse) {
                            cbfn(err, exceptionldata, xhr);
                        } else {
                            cbfn(err, alterdata, xhr);
                        }

                    } catch (e) {
                        if (initconfig.serviceisdebug) console.log(errorcodes.usercb)
                    }
                });
            } else {
                serviceafter(error, {}, response);
            }
        });
    });
};


var conditionmake = function(condition, onedata) {
    var p = new promise.Promise();
    var conditionoverridetemp = '';
    var splitdata = condition.split(',');
    var ctr = 0;
    splitdata.forEach(function(splitcondition) {
        onedata[splitcondition] = typeof onedata[splitcondition] == "undefined" ? "" : onedata[splitcondition];
        conditionoverridetemp = conditionoverridetemp + splitcondition + "= '" + onedata[splitcondition] + "' and ";
        if (ctr === splitdata.length - 1) {
            conditionoverridetemp = conditionoverridetemp + '1=1';
            p.done(null, conditionoverridetemp);
        }
        ctr++;
    });
    return p;
};

var escapeselectAll = function(modelname) {
    var p = new promise.Promise();
    var modeltotransorm = getModelbyName(modelname);

    var cntr = 0;
    var query = "";
    try {
        modeltotransorm.forEach(function(selmodelname) {
            if (selmodelname.fieldforsync) {
                query = query + selmodelname.fieldname + ",";
            }
            if (cntr === modeltotransorm.length - 1) {
                query = query + ' _sync';
                p.done(query);
            }
            cntr++;
        });

    } catch (e) {
        p.done("*");
    }

    return p;
};

var mapmodelValuetoSend = function() {
    var p = new promise.Promise();
    var dataforsync = [];
    var assignobj = {};
    var cntr = 0;
    var keyobj = Object.keys(_JS2SDK_._Model);
    dbhandler.transaction(function(tx) {
        keyobj.forEach(function(callmodel) {
            escapeselectAll(callmodel).then(function(selquery) {
                tx.executeSql("SELECT " + selquery + " FROM " + callmodel + " WHERE _sync='PUSH' OR _sync='POP'", [], function(txr, result) {
                    assignobj = {};
                    var tempretval = [];
                    for (i = 0; i < result.rows.length; i++) {
                        tempretval.push(result.rows.item(i));
                    }
                    assignobj[callmodel] = tempretval;
                    dataforsync.push(assignobj);
                    if (cntr === keyobj.length - 1) {
                        p.done(dataforsync);
                    }
                    cntr++;
                }, function(txr, err) {
                    if (cntr === keyobj.length - 1) {
                        p.done(dataforsync);
                    }
                    cntr++;
                });
            });


        });
    });
    return p;

};

var poptoDelete = function(contextdata,responsedata){
    console.log('reached');
    var response = responsedata;
    dbhandler.transaction(function(tx) {
        contextdata.models.forEach(function(modelname) {
            if (modelname.servicemodels.indexOf('_') < 0 && contextdata.servicemethod === 'GET') {
                noeval(modelname.servicemodelsmapname, response).then(function(err,modeldata){
                    modeldata.forEach(function(modelresult){
                        if(typeof modelresult._sync !== "undefined" && modelresult._sync == "POP"){
                            modelkey = modelname.servicecomparekey;
                            tx.executeSql("DELETE FROM " + modelname.servicemodels + " WHERE " + modelkey + " = '" + modelresult[modelkey] + "'");
                        }
                    });
                    
                });
            }
        });
    });
};

var changepushToDone = function(contextdata, request,response) {
    var modelselect = {};
    var modeldata = {};
    var modelkey = "";
    dbhandler.transaction(function(tx) {
        contextdata.postsyncmodels.forEach(function(modelname) {
            if (contextdata.servicemethod === 'POST' && modelname.servicemodels.indexOf('_') < 0) {
                noeval(modelname.servicemodelsmapname, request).then(function(err,modeldata){
                modelkey = modelname.servicecomparekey;
                tx.executeSql("UPDATE " + modelname.servicemodels + " SET _sync='SYNCED' WHERE " + modelkey + " = '" + modeldata[modelkey] + "'");
                });
             }
        });
       
    });
};

exports._JS2SDK_.sync = function() {
    var p = new promise.Promise();
    var selfntocall = [];
    try {
        mapmodelValuetoSend().then(function(modelstopush) {
            var initmodel = getModelbyName('_initproject');
            _JS2SDK_.setHeaders({});
            var objdata = {};
            var stringifiedobj = "";
            var context = _synccall;
            objdata.models = modelstopush;
            stringifiedobj = JSON.stringify(objdata);
            syncinternal(stringifiedobj, function(context, data) {
                cb(context, data, function(err, data, xhr) {
                    if (xhr.status !== 200) {
                        return;
                    }
                    var modelkey = Object.keys(_JS2SDK_._Model);
                    modelkey.forEach(function(selmodname) {
                        dbhandler.transaction(function(tx) {
                            tx.executeSql("UPDATE " + selmodname + " SET _sync= 'SYNCED' WHERE _sync = 'PUSH' ", [], function(a, b) {
                                if (initconfig.serviceisdebug) {
                                    console.log("UPDATED");
                                }
                                p.done(null, "UPDATED");
                            });
                            tx.executeSql("DELETE FROM " + selmodname + " WHERE _sync = 'POP' ", [], function(a, b) {
                                if (initconfig.serviceisdebug) {
                                    console.log("DELETED");
                                }
                                p.done(null, "DELETED");
                            });
                        });
                    });

                    Object.keys(_Call).forEach(function(callmethod) {
                        if (_Call[callmethod].includeforsynccall) {
                            window[prefix.main][callmethod]({},function(context,data){
                                cb(context,data,function(err,data,xhr){});
                            });
                        }
                    });
                });
            });
        });
    } catch (e) {
        p.done(errorcodes.syncerror);
    }

    return p;
};

var querybuilder = function(operation, tname, schema, data, condition, incommingdate, exceptiondat) {
    var p = new promise.Promise();
    var ctr = 0;
    var querypart1 = '';
    var querypart2 = '';
    var valuequery = '';
    var conditionoverride = '';
    var insertarrayel, updatearrayel = [];
    incommingdate = (typeof incommingdate === "undefined" || incommingdate.length < 1) ? "N" : incommingdate;
    if (operation == "UPSERT") {
        dbhandler.transaction(function(tx) {
            if (typeof data === "undefined") {
                p.done(null, exceptiondat);
            }
            try {
                data.forEach(function(onedata) {
                    conditionoverride = '';
                    conditionmake(condition, onedata).then(function(err, conditionoverride) {
                        tx.executeSql('SELECT * FROM ' + tname + " WHERE " + conditionoverride, [], function(tx, results) {
                            if (results.rows.length < 1) {
                                querypart1, querypart2 = '';
                                querypart1 = "INSERT into " + tname + "(";
                                valuequery = '';
                                insertarrayel = [];
                                schema.forEach(function(tabledetails) {
                                    if (tabledetails.fieldrequired && typeof onedata[tabledetails.fieldname] !== "undefined") {
                                        querypart2 = querypart2 + tabledetails.fieldname + ',';
                                        valuequery = valuequery + "?,";
                                        insertarrayel.push(onedata[tabledetails.fieldname]);
                                    }
                                });
                                valuequery = valuequery + "?)";
                                insertarrayel.push(incommingdate);
                                querypart2 = querypart2 + "dtetime)VALUES(";
                                tx.executeSql(querypart1 + querypart2 + valuequery, insertarrayel, function() {
                                    if (ctr === data.length - 1) {
                                        p.done(null, exceptiondat);
                                        return p;
                                    }
                                    ctr++;
                                });
                            } else {
                                querypart1, querypart2 = '';
                                querypart1 = "UPDATE " + tname + " SET ";
                                valuequery = '';
                                updatearrayel = [];
                                schema.forEach(function(tabledetails) {
                                    if (tabledetails.fieldrequired && typeof onedata[tabledetails.fieldname] !== "undefined") {
                                        querypart2 = querypart2 + tabledetails.fieldname + " = ?,";
                                        updatearrayel.push(onedata[tabledetails.fieldname]);
                                    }
                                });
                                querypart2 = querypart2.substring(0, querypart2.length - 1) + " WHERE " + conditionoverride;;
                                tx.executeSql(querypart1 + querypart2, updatearrayel, function() {
                                    if (ctr === data.length - 1) {
                                        p.done(null, exceptiondat);
                                        return p;
                                    }
                                    ctr++;
                                });
                            }
                        });
                    });
                });
            } catch (e) {
                p.done(errorcodes.dbinsert, exceptiondat);
            }
        });
    }
    return p;
};

var noeval = function(grammer, parseobj) {
    var p = new promise.Promise();
    var grammerobj = grammer.split(".");
    var parsereserve = {};
    var cntr = 0;
    grammerobj.forEach(function(gdata) {
        if (parseobj.hasOwnProperty(gdata)) {
            if (Object.keys(parsereserve).length < 1) {
                parsereserve = parseobj;
            } else {
                parsereserve = parsereserve[gdata];
            }

        }
        if (cntr === 0) {
            parsereserve = parseobj;
        }
        if (cntr === grammerobj.length - 1) {
            p.done(null, parsereserve);
        }
        cntr++;
    });

    return p;
};

var findExceptions = function(context, responseobj) {
    var p = new promise.Promise();
    var retexceptionalobj = {};
    var keysplit = [];
    var key = "";
    var response = JSON.parse(responseobj);
    var exceptionalfields = context.exceptionalfields.length > 0 ? context.exceptionalfields.split(",") : false;
    var cntr = 0;
    if (exceptionalfields.length) {
        exceptionalfields.forEach(function(exceptionfld) {
            keysplit = exceptionfld.split(".");
            key = keysplit[keysplit.length - 1];
            noeval(exceptionfld, response).then(function(err, evalparsed) {
                if (err) {
                    console.log(errorcodes.grammer);
                    return;
                }
                retexceptionalobj[key] = evalparsed;
                if (cntr === exceptionalfields.length - 1) {
                    p.done(retexceptionalobj);
                }
                cntr++;

            });


        })
    } else {
        p.done({});
    }

    return p;
};

var serviceafter = function(error, context, responseobj) {
    var p = new promise.Promise();
    if (error) {
        if (initconfig.serviceisdebug) console.log(error);
        p.done(error);
        return p;
    }
    var response = JSON.parse(responseobj);
    var incommingdate = typeof context.datefieldsendnameifany !== 'undefined' && context.datefieldsendnameifany.length > 0 ? response[context.datefieldsendnameifany] : "";
    addtime(context.servicename, incommingdate);
    if (!context.servicepersistresponse) {
        p.done(null, responseobj);
        return p;
    }
    findExceptions(context, responseobj).then(function(exceptiondata) {
        var fetchedmodels = {};
        var servervals = {};
        var ctr = 0;
        try {
            context.models.forEach(function(contextmodel) {
                noeval(contextmodel.servicemodelsmapname, response).then(function(err, servervals) {
                    if(err){console.log(errorcodes.grammer); return;}
                    if (typeof servervals === "undefined" || servervals === "" || servervals === {}) {
                        p.done(errorcodes.noserverresponse, {}, exceptiondata);
                    }
                    fetchedmodels = getModelbyName(contextmodel.servicemodels);
                    querybuilder("UPSERT", contextmodel.servicemodels, fetchedmodels, servervals, contextmodel.servicecomparekey, incommingdate, exceptiondata).then(function(err, exceptiondatas) {
                        if (ctr === context.models.length - 1) {
                            poptoDelete(context,response);
                            p.done(err, {}, exceptiondatas);
                        }
                        ctr++;
                    });

                });


            });
        } catch (e) {
            p.done(errorcodes.nomodels, {}, exceptiondata);
        }

    });
    return p;
};