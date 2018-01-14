'use strict';

const {exists, writeFile, askIface, readFile} = require('../lib');
const interfaces = require('../lib').interfaces;


module.exports = {
    iptables: async (iface, file) => {
        if (!exists('/etc/docker-hive/nodes.json')) throw new Error('Configs are missing. Please install first.');
    
        let ips = readFile('/etc/docker-hive/nodes.json', 'utf8');
        ips = ips || '[]';
        try {
            ips = JSON.parse(ips);
        } catch (e) {
            ips = [];
        }
    
        if (!Array.isArray(ips)) throw new Error('Invalid config: nodes.json');
    
        if (!interfaces.length) {
            throw new Error('No active network interfaces found.');
        }
    
        if (!iface && interfaces.length === 1) iface = interfaces[0];
        if (!iface) iface = await askIface();
        if (!iface || !interfaces.includes(iface)) {
            throw new Error('Network interface ' + iface + ' not found.');
        }
        
        let rule = `
# Docker swarm ports

iptables -A INPUT -p tcp -i docker0 --dport 2376 -j ACCEPT
iptables -A INPUT -p tcp -i docker0 --dport 2377 -j ACCEPT
iptables -A INPUT -p tcp -i docker0 --dport 7946 -j ACCEPT
iptables -A INPUT -p udp -i docker0 --dport 7946 -j ACCEPT
iptables -A INPUT -p udp -i docker0 --dport 4789 -j ACCEPT

iptables -A INPUT -p tcp -i docker_gwbridge --dport 2376 -j ACCEPT
iptables -A INPUT -p tcp -i docker_gwbridge --dport 2377 -j ACCEPT
iptables -A INPUT -p tcp -i docker_gwbridge --dport 7946 -j ACCEPT
iptables -A INPUT -p udp -i docker_gwbridge --dport 7946 -j ACCEPT
iptables -A INPUT -p udp -i docker_gwbridge --dport 4789 -j ACCEPT

# Dockerd metrics

iptables -A INPUT  -p tcp -i docker_gwbridge --dport 9323 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -p tcp -i docker_gwbridge --sport 9323 -m state --state ESTABLISHED     -j ACCEPT

# Nodes
`;
    
        for (let ip of ips) {
            rule += `
iptables -A INPUT  -p tcp -s "${ip}" -i ${iface} --dport 2376 -j ACCEPT
iptables -A INPUT  -p tcp -s "${ip}" -i ${iface} --dport 2377 -j ACCEPT
iptables -A INPUT  -p tcp -s "${ip}" -i ${iface} --dport 7946 -j ACCEPT
iptables -A INPUT  -p udp -s "${ip}" -i ${iface} --dport 7946 -j ACCEPT
iptables -A INPUT  -p udp -s "${ip}" -i ${iface} --dport 4789 -j ACCEPT
            `;
        }
    
        if (file) writeFile(file, rule + '\n');
        console.log(rule);
    }
};