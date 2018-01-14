'use strict';

const {exec} = require('../lib');


module.exports = {
    stop: async () => {
        console.log('Stopping hive...');
        
        exec('docker stack rm hive');
        exec('docker stop $(docker ps -a -q --filter="name=hive_snet")');
        exec('docker rm $(docker ps -a -q --filter="name=hive_snet")');
    }
};