'use strict';

const {exists, writeFile, readFile} = require('../lib');


module.exports = {
    add: async (ip) => {
        if (!exists('/etc/docker-hive/nodes.json')) throw new Error('Configs are missing. Please install first.');
        
        let ips = readFile('/etc/docker-hive/nodes.json', 'utf8');
        ips = ips || '[]';
        try {
            ips = JSON.parse(ips);
        } catch (e) {
            ips = [];
        }
        
        if (!Array.isArray(ips)) throw new Error('Invalid config: nodes.json');
        
        ips.push(ip);
        
        writeFile('/etc/docker-hive/nodes.json', JSON.stringify(ips, null, 4));
        
        console.log('Node added.');
    },
    
    rm: async (ip) => {
        if (!exists('/etc/docker-hive/nodes.json')) throw new Error('Configs are missing. Please install first.');
    
        let ips = readFile('/etc/docker-hive/nodes.json', 'utf8');
        ips = ips || '[]';
        try {
            ips = JSON.parse(ips);
        } catch (e) {
            ips = [];
        }
    
        if (!Array.isArray(ips)) throw new Error('Invalid config: nodes.json');
        
        let i = ips.indexOf(ip);
        while (i !== -1) {
            ips.splice(i, 1);
            i = ips.indexOf(ip);
        }
    
        writeFile('/etc/docker-hive/nodes.json', JSON.stringify(ips, null, 4));
        
        console.log('Node removed.');
    },
    
    list: async () => {
        if (!exists('/etc/docker-hive/nodes.json')) throw new Error('Configs are missing. Please install first.');
    
        let ips = readFile('/etc/docker-hive/nodes.json', 'utf8');
        ips = ips || '[]';
        try {
            ips = JSON.parse(ips);
        } catch (e) {
            ips = [];
        }
    
        if (!Array.isArray(ips)) throw new Error('Invalid config: nodes.json');
        
        console.log(ips.join('\n'));
    }
};