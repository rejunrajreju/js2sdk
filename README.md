# JS2SDK

JS2SDK is an SDK generator for javascript based client scripts. It is an Open source tool which will help you to compose the projects in an organised way, no matter what is your server. This tool will help the developers, mainly Hybrid Mobile App developers to concentrate more on business logic leaving other technical functional implementation like login, offline data management, synchronisation in an effective way. Dont get confused, Js2sdk is not a framework. It is an SDK generator build for your project and can be used with any client side framework like angular js, jquery or with a plain javascript.


## Installation

```
npm install -g js2sdk 

```
## Quick Reference

```
js2sdk init
js2sdk config db
js2sdk create model
js2sdk create services
js2sdk clear cache
js2sdk publish
js2sdk createsync
```

## Project Initialisation [ js2sdk init ]
Js2sdk starts with init command. This will prompt for some basic inputs from user to start - project name, Author name/ Company name and decision regarding websql and debug mode. Currently Js2sdk supports Websql and Sqlite DB. Kindly note SQlite DB will work only if you are running on top of cordova/phonegap project and sqlite plugin is installed.

```
js2sdk init
[PROJECT NAME] myapp
[AUTHOR] Abdul Kalam
[USE WEBSQL] (Y/N) Yes
[DEBUG MODE] (Y/N) Yes
```

## Database [ js2sdk config db ]
It will ask some basic questions for creating DB like Db name, version and size. Kindly note DB Size will be applicable only for Websql.

```
js2sdk config db
[DB Name] myappdb
[DB VERSION] (1.0.0) 2
[DB Size] (5) 5

```

##Models

Models deals with data of you project. Js2sdk automatically creates db either in the websql or sqlite db based on the configuration. You have two different sets of models. User defined models and System Models. First we will discuss about user defined Model. Imagine following is the web service response that you are expecting {"Comments":[], "userprofile":[], "publiclist":{"notification":[],"message":[] }} and you identified only Comments and message should be saved not others. In such scenario you can create models for comments and message. Excluding and including the data set is a different topic we discuss about it later. Let us assume we have following fields name, text, id, date and sender associated with comments but we don't want to save the sender information even if the server provides the data. Please opt 'No' when system asks [NEED TO SAVE ON GET CALL] respective to the sender field. [FIELD INCLUDE FOR SYNC] is used for syc function of js2sdk whcih we will discuss it later. We can have this model attached with service at any levels.


```
js2sdk create models
[MODEL NAME] comments
[Number of Fields] 2
[FIELD NAME] text
[TYPE] String
[NEED TO SAVE ON GET CALL] Yes
[Default] 
[FIELD INCLUDE FOR SYNC] Yes
[FIELD NAME] sender
[NEED TO SAVE ON GET CALL] No
[Default]
[FIELD INCLUDE FOR SYNC] Yes
```

## Built in Models

Js2sdk also provides Built in models like _LOGIN. This models deal with simple authentication method and will allow your project to deal with authentication without any code, meaning js2sdk will save and send the auth token for you based on the servicerequired and authisheader of service json. You have the option to send this auth via header and as a query params we will look into it later

## Insert Data
```
_JS2SDK_._Model.comments.insert({ "name":"Abdul Kalam" }).then(function(e,data){ console.log(data) }); 
```

It will automatically update the status of the data to PUSH. This matters at the time of inbuilt sync operations or at the time of executing post calls. We have four different set of status. We will discuss abt it latter. However if you don't want the status to be updated then you can pass the second params as true.

```
_JS2SDK_._Model.comments.insert({ "name":"Abdul Kalam" },true); 
```

## Update Data

Updation takes two three params. First one is data, second is your condition and third one is optional for status updation. You can pass multiple conditions using 'and' keyword.
```
_JS2SDK_._Model.comments.update({ "name":"Abdul Kalam" },"name = 'Dr Abdul Kalam'").then(function(e,data){ console.log(data) }); 
```

## Delete Data

Delete expects two params. first one is condition and second one is for status updation. condition is madatory for deletion. 
```
_JS2SDK_._Model.comments.delete({ "id='100'" }).then(function(e,data){ console.log(data) }); 
```
# Find Data
```
_JS2SDK_._Model.comments.find( "name='Dr Abdul Kalam'" ).then(function(e,data){ console.log(data.item(0))}); 

```
## Status
**JS2SDK has four different set of Status Flag.**

	*	UNATTEND: This is the default status. It means the data is not altered from the client side. 
	*	PUSH: Your data will be update with PUSH status if you run either insert or update. Js2sdk identifies the data and push to server automatically based on the status if you have configured sync.
	*	POP: This will come into picture when you try to delete a tuple. The data will be deleted only after a successful callback. If you use configured JS2SDK sync function or you have a plan to use a different web service call for deletion of the data js2sdk makes it simple by identifying the data needs to be deleted and will delete if the xhr status is 200 
	*	SYNCED: PUSH status will be changed to SYNCED if your data is pushed to server. 


## Service

Js2sdk currently deal only with REST calls. Via service you can implements all your web service call. One question which can probably arise is whether we can use xhr handler of the corresponding framework inspite of using this, answer is NO because js2sdk wraps xhr request and does lots of background work based on the configurations. Js2sdk creates method for web service call based on the name you have given. You can access the service using _JS2SDK_ notation.

```
js2sdk create service
[SERVICE NAME] getComments
[RESPONSE PERSISTANCE] Yes
[SERVICE TRIGGER URL] http://www.js2sdk.com
[METHOD] GET
[Auth REQUIRED] Yes
[SEND AUTH VIA HEADER] Yes 
[NUMBER OF RESPONSE MODELS] 2
[RESPONSE MODELS] comments
[SERVICE RESPONSE MAP NAME] response.data.Comments
[MODEL COMPARE KEY (COMMA SEPERATED)] id
[RESPONSE MODELS] profile
[SERVICE RESPONSE MAP NAME] response.data.user.Profile
[MODEL COMPARE KEY (COMMA SEPERATED)] profileid

```

* [SERVICE NAME]: It is asking for the name of the current service. Name should not contain any special chars. 
* [RESPONSE PERSISTENCE]: It is asking whether you want to save all the data on execution of the service call response.
* [SERVICE TRIGGER URL]: Provide the complete url for the current service
* [METHOD]: Select a method from the list you get.
* [AUTH REQUIRED]: It is asking whether this service needs authentication to get passed.
* [SEND AUTH VIA HEADER]: It is asking whether the auth token should pass via Header or Query params.
* [NUMBER OF RESPONSE MODELS]: Give the number of models to be attached with the service. If you give two it will iterate twice for the further details
* [RESPONSE MODELS]: Model Name. You will get list of models that you have created along with inbuilt model.
* [SERVICE RESPONSE MAP NAME]: Suppose you expect data for comments like {data:{comments:[]}} from the server then mapping should like response.data.comments
* [MODEL COMPARE KEY (COMMA SEPARATED)]: Data from the server will compare with the key you provide here. Key can be either one or multiple for example id,name. Here data will be compared with name and id before insert or update

JS2SDK also provides some other configuration for service but that will not be presented via CLI. Because it is for some exceptional case and JS2SDK do not want user to get confused with lots of configurations. If you want to alter it, go to the service folder and choose your service then edit your service. Kindly note, if you change the service data please make sure you run js2sdk clear cache before js2sdk publish. 

* exceptionalfields: By default js2sdk will not serve you data from the server if you are in persistant mode but if you need any data say notifications userupdates {"data":{"comments":[],"userupdates":[]},"notification":[]} to be serve back via promise then you can add it here like "response.notification,response.data.userupdates 
* datefieldsendnameifany: If you want to save the server time of the current service call you can use it if the sever provides it. Js2sdk is capable of sending this captured time automatically on next call if you want 
* postsyncmodels: If you don't have any plan to use inbuilt sync function but you need to update the status of the data you push to server in such cases you can provide the model details here. It should be an array with servicemodels, servicemodelsmapname and servicecomparekey for each model.
* postsyncdatefield: As i mentioned earlier you can pass the date captured of by last call. provide a key for the date to be sent.
* includeforsynccall: By default it is false. If you want this service to be considered on sync call then please make it true. 

```
_JS2SDK_.getComments({},function(context,data){ console.log('before call back');  cb(context,data,function(err,data,xhr){ //user code to be executed after the service call console.log(data); }); }) 
```

## Login 
As I mentioned earlier js2sdk is capable of dealing with simple auth. It means it automatically take cares of auth token and will send the token on each call if the call requires to be authenticated. To do this first you need to find _LOGIN model under model folder then change the settings accordingly.

	* id: Name of the key for auth token that server send after successful login 
	* Auth: Name of the key to contain auth token for subsequent calls 

Create a service and select [RESPONSE MODELS] as _LOGIN. You are done with login configurations.

	* js2sdk create service
	* [SERVICE NAME] login
	* [RESPONSE PERSISTANCE] Yes
	* [SERVICE TRIGGER URL] http://[login url]
	* [METHOD] POST
	* [Auth REQUIRED] No
	* [SEND AUTH VIA HEADER] No 
	* [NUMBER OF RESPONSE MODELS] 1
	* [RESPONSE MODELS] _Login
	* [SERVICE RESPONSE MAP NAME] response
	* [MODEL COMPARE KEY (COMMA SEPERATED)] 

```
_JS2SDK_.login({"email":"rejun@gmail.com","password" : "rejun"},function(context,data){ console.log('before execution starts');  cb(context,data,function(err,data,xhr){  //user code to be executed after login }); }); 

```

## js2sdk clear cache 
You are free to alter the service and models. Remember to run js2sdk clear cache before you run js2sdk publish if you have altered the model or service.


##js2sdk publish 
This will generate SDK.

## Headers 
Additional headers can be set using setHeaders
```
_JS2SDK_.setHeaders("Content-Type","application/json"); 
```
## Sync 
js2sdk createsync command will help you to initialise Sync. This command will create _sync.json in service folder now you can change request url and auth property of the service and change the property includeforsynccall of all the service you want to be executed using the sync call. Now you can call _JS2SDK_.sync(). Sync finds the tuple of all models that are in PUSH and POP state and send it to the server and also executes the service which has the property includeforsynccall (preferably GET call services). That means it sends all manipulated data then it calls all the GET services one by one.

## Model (fieldforsync) 

This matters for sync function. If you don't want the property of a model to be examined by js2sdk for sync then that property should be excluded. To do that go to model then change value of fieldforsync from true to false. 

## Service (postsyncmodels) 
Scenario: You need to post some data to the server for that you have created service named postData. Since you are not expecting any data from server as response to save in local db you are not choosing RESPONSE PERSISTENCE and RESPONSE MODELS. Now from code you have updated the data of the comment model and it makes the status of the tuple from UNATTEND to PUSH even though you are sending the data using postData the sdk generator will not change the status from PUSH to synced. To make that updated you need to identify the name of the model you are going to push, the data you are planning to send has association with comment model, dashboard model, profile model and data without any model mapping but you observed only comments need to be updated with status. In that case you can add following data in the postsyncmodels.
```
"postsyncmodels": [{ "servicemodels": "comments", "servicemodelsmapname": "request", "servicecomparekey": "name" }] 
```
## Support 
As of now js2sdk supports only Chrome and Safari

## Library used in the code 

Promise JS, https://github.com/stackp/promisejs, Thanks team for creating such a small library deal with promise

## Developer: 

**Rejunraj CK, rejunrajreju@gmail.com**￼ ￼ 


## License

MIT