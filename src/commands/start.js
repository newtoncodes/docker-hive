'use strict';

const execSync = require('child_process').execSync;
const {exec, getVars, version, readFile, writeFile} = require('../lib');


module.exports = {
    start: async () => {
        let ports = '';
        let config = getVars();
    
        let hostIp = null;
        try {
            hostIp = execSync('cut -d\'/\' -f1 <<< `ip -o addr show docker_gwbridge | awk \'{print $4}\'`');
        } catch (e) {
            hostIp = null;
        }
    
        if (!hostIp) throw new Error('Cannot find docker_gwbridge interface.');
        
        if (config['PUBLISH']) {
            ports = ' -p "3000:3000" -p "3001:3001" -p "3002:3002" -p "3003:3003" -p "3004:3004"';
        }
        
        let yml = readFile(__dirname + '/../tpl/stack.yml', 'utf8').replace(/{{VERSION}}/g, version).replace(/{{HOST_IP}}/g, hostIp);
        
        for (let key of Object.keys(config)) {
            yml = yml.replace(new RegExp('{{' + key + '}}', 'g'), config[key]);
        }
    
        writeFile('/etc/docker-hive/stack.yml', yml);
        
        exec('docker stack deploy --compose-file /etc/docker-hive/stack.yml --with-registry-auth hive');
        exec('docker run --name hive_snet --detach --hostname snet --restart always --cap-add=NET_ADMIN --device=/dev/net/tun --network=hive -v /etc/docker-hive/vpn:/etc/snet' + ports + ' newtoncodes/hive-snet:' + version)
    }
};