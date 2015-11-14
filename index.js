#! /usr/bin/env node

var commands = process.argv.splice(2);
var exec = require('child_process').exec;
var chalk = require('chalk');
var Q = require('Q');
var banner = require('./banner.js');
var service = require('./service.js');

service.createStrecture();

if (typeof commands === 'undefined') {
    help();
    return;
} else {

    switch (commands[0]) {
        case 'create':
            service.executeCreate(commands[1]);
            break;
        case 'config':
            service.executeConfig(commands[1]);
            break;
        case 'init':
            service.init();
            break;  
        case 'createsync':
            service.syncinit();
            break;          
        case 'publish':
            service.makeSDK();
            break;
        case 'clear':
            service.executeBind(commands[1]);
            break;
        default:
            help();
    }
}

function help() {
    console.log(chalk.green('Start project ' + chalk.blue.underline.bold('js2sdk init')));
    console.log(chalk.green('Create a model ' + chalk.blue.underline.bold('js2sdk create model')));
    console.log(chalk.green('Create a service ' + chalk.blue.underline.bold('js2sdk create service')));
    //console.log(chalk.green('Initialize DB ' + chalk.blue.underline.bold('js2sdk config initdb')));
    console.log(chalk.green('Config DB ' + chalk.blue.underline.bold('js2sdk config db')));
    console.log(chalk.green('Clear Cache ' + chalk.blue.underline.bold('js2sdk clear cache')));
    console.log(chalk.green('Create sync structure ' + chalk.blue.underline.bold('js2sdk createsync')));
    console.log(chalk.green('publish the sdk ' + chalk.blue.underline.bold('js2sdk publish')));

    console.log('');
}