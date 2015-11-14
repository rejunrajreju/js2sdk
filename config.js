
module.exports = {
	
	filenames:{
		db:'db',
		init: 'config',
		sync: '_sync'
	},
	prefix:{
		model:'_M_',
		main:'_JS2SDK_',
		fnc:'_Call',
		modelinstance:'_Model',
		sync:'_synccall',
		syninternalfn :'syncinternal'
	},
	loc:{
		services : './services',
		config:'./config',
		models:'./models',
		servicebindings : __dirname +'/workspace/service-bindings.js',
		modelbindings:__dirname +'/workspace/models-bindings.js',
		sdkname: '/js2sdk.js',
		promise:'/promise.min.js',
		templateservice:'/templates/template-service.js',
		templateopen:'/templates/template-opener.js',
		templateclose:'/templates/template-close.js',
		templatesave:'/templates/template-save.js',
		templateconstants:'/templates/template-constants.js',
		sdkminified: 'js2sdk.min.js'
	}
	
}