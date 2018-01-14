'use strict';

const {exec} = require('../lib');


module.exports = {
    stop: async () => {
        console.log('Stopping hive...');
        
        exec('docker stack rm hive');
    }
};