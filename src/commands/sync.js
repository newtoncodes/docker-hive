'use strict';

const http = require('http');
const {exec} = require('../lib');


module.exports = {
    sync: async () => {
        console.log('Syncing hive...');
    
        http.get(hostIp + '/', res => {
            res['setEncoding']('utf8');
        
            let body = '';
            res.on('data', data => body += data);
            res.on('end', () => {
                try {
                    body = JSON.parse(body);
                } catch (e) {
                    throw new Error('Could not get nodes list.');
                }
            
                writeFile('/etc/docker-hive/nodes.json', JSON.stringify(body, null, 4));
            });
        });
    }
};