	var prefix = {
		model:'_M_',
		main:'_JS2SDK_',
		syncobj : '_synccall',
		syninternalfn :'syncinternal'
	};
	var inmemory = {};
	var headers = {};
	var dbhandler = {};
	var initconfig= {};

	var errorcodes = {
		'dbopen': 'Error 1000: Your platform doesnt support SQLITE database',
		'nomodels': 'Error 1001: No Models Found',
		'noserverresponse': 'Error 1002: Either you checked on the persistancy for SDK models or No data from server found to the corrsponding model',
		'dbinsert': 'Error 1003: Database Inserion Error, Pease check your service persistancy',
		'usercb': 'Error 1004: User defined callback execution failure',
		'queryerror': 'Error 1005: Error in executing query',
		'deleteerror': 'Error 1006: Needs condition to delete an item',
		'sessionerror': 'Error 1007: Session Token cannot be saved. Issue with the mapping or no login call',
		'syncerror': 'Error 1008: Error in syncronization',
		'grammer': 'Parse Error, Check the service and make sure the grammer is correct'
	}

	var modelInstance = function(obj){
	    this.obj = obj;
	    this.fieldsplit = this.obj.split('.');
	    this.modelname = this.fieldsplit[this.fieldsplit.length-1];

	    this.insert = function(insertobj,nostatus){
	    	var p = new promise.Promise();
	    	var insertkeys = Object.keys(insertobj);
	    	var conditiontext = "";
	    	var conditiontextsecond = "";
	    	var conditionarray = [];
	    	var objsplited = this.obj.split('.');
	    	var selmodel = window[prefix.main][prefix.model][objsplited[objsplited.length-1]];
	    	insertkeys.forEach(function(insertkey){
	    		selmodel.forEach(function(selmodelitem){
	    			if(selmodelitem.fieldname === insertkey){
	    				conditiontextsecond = conditiontextsecond+" ?,";
	    				conditiontext = conditiontext + insertkey+",";
	    				conditionarray.push(insertobj[insertkey]);
	    			}
	    		});
	    	});
		    	if(typeof nostatus !== 'undefined' && nostatus === true){
		    		conditiontextsecond = conditiontextsecond.substring(0,conditiontextsecond.length-1);
		    		conditiontext = conditiontext.substring(0,conditiontext.length-1);
		    	}else{
		    		conditiontextsecond = conditiontextsecond+ " ? ";
			    	conditiontext = conditiontext +"_sync";
			    	conditionarray.push('PUSH');
		    	}
	   
	    	
	    	(function(that){dbhandler.transaction(function(tx) {
		    	tx.executeSql("INSERT INTO "+that.modelname+" ("+conditiontext+")"+ "VALUES ("+conditiontextsecond+")",conditionarray,function(tx,result){
		    		p.done(null,result.rows);
		   		},function(tx,error){
		   			p.done(error.message,{});
		   		});
	    	})})(this);
	        return p;
	    };

	    this.find = function(condition){
	    	var p = new promise.Promise();
	    	var conditions = (typeof condition=== "undefined")? "1=1":condition;
	    	var thismodel = this.modelname;
	    	(function(that){dbhandler.transaction(function(tx) {
		    	tx.executeSql("SELECT * FROM "+that.modelname+ " WHERE "+conditions,[],function(tx,result){
		    		p.done(null,result.rows);
		   		},function(tx,error){
		   			p.done(error.message,{});
		   		});
	    	})})(this);
	        return p;
	    };

	    this.update = function(updateobj,condition,nostatus){
	        var p = new promise.Promise();
	        var conditions = (typeof condition=== "undefined")? "1=1":condition;
	        var objsplited = this.obj.split('.');
	    	var selmodel = window[prefix.main][prefix.model][objsplited[objsplited.length-1]];
	    	var insertkeys = Object.keys(updateobj);
	    	var conditiontext = "";
	    	var conditionarray = [];
	    	insertkeys.forEach(function(insertkey){
	    		selmodel.forEach(function(selmodelitem){
	    			if(selmodelitem.fieldname === insertkey){
	    				conditiontext = conditiontext + insertkey+"=?,";
	    				conditionarray.push(updateobj[insertkey]);
	    			}
	    		});
	    	});
	    	
	    		if(typeof nostatus !== 'undefined' && nostatus === true){
		    		conditiontext = conditiontext+ " _sync = ? ";
	    			conditionarray.push('UNATTEND');
		    	}else{
		    		conditiontext = conditiontext+ " _sync = ? ";
	    			conditionarray.push('PUSH');
		    	}

	    	(function(that){dbhandler.transaction(function(tx) {
		    	tx.executeSql("UPDATE "+that.modelname+" SET "+conditiontext+ " WHERE "+conditions,conditionarray,function(tx,result){
		    		p.done(null,result.rows);
		   		},function(tx,error){
		   			p.done(error.message,{});
		   		})
	    	})})(this);
	        return p;
	    };

	    this.delete = function(condition,nostatus){
	    	var p = new promise.Promise();
	    	if(typeof condition === "undefined"){
	    		p.done(errorcodes.deleteerror,{});
	    		return p;
	    	}
	    		if(typeof nostatus === 'undefined' || nostatus === false){
		    		(function(that){dbhandler.transaction(function(tx) {
			    	tx.executeSql("UPDATE "+that.modelname+ " SET _sync='POP' WHERE "+condition,[],function(tx,result){
			    		p.done(null,result.rows);
			   		},function(tx,error){
			   			p.done(error.message,{});
			   		});
	    			})})(this);
		    	}else{
		    		(function(that){dbhandler.transaction(function(tx) {
			    	tx.executeSql("DELETE FROM "+that.modelname+ " WHERE "+condition,[],function(tx,result){
			    		p.done(null,result.rows);
			   		},function(tx,error){
			   			p.done(error.message,{});
			   		});
	    			})})(this);
		    	}

	        return p;
	    }

	};