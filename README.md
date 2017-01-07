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

## License

MIT