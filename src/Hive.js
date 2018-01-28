'use strict';

const http = require('http');
const exists = require('fs').existsSync;
const readFile = require('fs').readFileSync;
const writeFile = require('fs').writeFileSync;
const exec = require('child_process').execSync;
const dotenv = require('dotenv');
const Utils = require('./Utils');
const version = require('../package.json').version;


class Hive {
    constructor() {
        if (!exists('/etc/docker-hive') || !exists('/etc/docker-hive/hive.conf') || !exists('/etc/docker-hive/env.conf')) {
            throw new Error('Hive is not installed. Please run hive init or hive join first.');
        }
    
        let config = null;
    
        try {
            config = dotenv.parse(readFile('/etc/docker-hive/hive.conf'));
        } catch (e) {
            throw new Error('Cannot parse config file: /etc/docker-hive/hive.conf');
        }
    
        if (!config) {
            throw new Error('Cannot parse config file: /etc/docker-hive/hive.conf');
        }
        
        let env = null;
    
        try {
            env = dotenv.parse(readFile('/etc/docker-hive/env.conf'));
        } catch (e) {
            throw new Error('Cannot parse config file: /etc/docker-hive/env.conf');
        }
    
        if (!env) {
            throw new Error('Cannot parse config file: /etc/docker-hive/env.conf');
        }
        
        if (!env['type'] || !['master', 'manager', 'worker'].includes(env['type'])) {
            throw new Error('Invalid env config. Please manually fix the error or reinstall.');
        }
        
        if (!env['host'] || !(env['host'].match(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
            throw new Error('Invalid env config. Please manually fix the error or reinstall.');
        }
    
        if (env['type'] === 'master' && (!env['gateway'] || !(env['gateway'].match(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)))) {
            throw new Error('Invalid env config. Please manually fix the error or reinstall.');
        }
    
        this._type = env['type'];
        this._host = env['host'];
        this._gateway = env['gateway'];
    
        if (!config['apiKey'] || !config['apiSecret']) {
            throw new Error('Invalid api key or secret. Please fix the config.');
        }
    
        if (this._type === 'master' && (!config['adminUsername'] || !config['adminPassword'])) {
            throw new Error('Invalid admin username or password. Please fix the config.');
        }
        
        if (this._type === 'master') this._config = {
            iface: config['iface'],
            
            apiKey: config['apiKey'],
            apiSecret: config['apiSecret'],
            
            adminUsername: config['adminUsername'],
            adminPassword: config['adminPassword'],
    
            slackKey: config['slackKey'] || '',
            slackChannel: config['slackChannel'] || '',
            slackUsername: config['slackUsername'] || '',
            
            publishPorts: config['publishPorts'] && (
                config['publishPorts'].toLowerCase() === '1' ||
                config['publishPorts'].toLowerCase() === 'y' ||
                config['publishPorts'].toLowerCase() === 'yes'
            ),
    
            iptablesCallback: config['iptablesCallback'] || ''
        };
        else this._config = {
            iface: config['iface'],
            
            apiKey: config['apiKey'],
            apiSecret: config['apiSecret'],
    
            iptablesCallback: config['iptablesCallback'] || ''
        };
    }
    
    async start() {
        this._checkMaster();
        
        console.log('Starting hive...');
        
        let ports = '';
        if (this._config.publishPorts) {
            ports = ' -p "3000:3000" -p "3001:3001" -p "3002:3002" -p "3003:3003" -p "3004:3004"';
        }
    
        let yml = readFile(__dirname + '/tpl/stack.yml', 'utf8');
        
        yml = yml.replace(/{{VERSION}}/g, version);
        yml = yml.replace(/{{GATEWAY}}/g, this._gateway);
        yml = yml.replace(/{{ADMIN_USERNAME}}/g, this._config.adminUsername);
        yml = yml.replace(/{{ADMIN_PASSWORD}}/g, this._config.adminPassword);
        yml = yml.replace(/{{SLACK_KEY}}/g, this._config.slackKey);
        yml = yml.replace(/{{SLACK_CHANNEL}}/g, this._config.slackChannel);
        yml = yml.replace(/{{SLACK_USERNAME}}/g, this._config.slackUsername);
        
        writeFile('/etc/docker-hive/stack.yml', yml);
        
        rmContainer('hive_snet');
        try {
            console.log('Creating service hive_snet');
            exec(
                'docker run --name hive_snet --detach --hostname snet --restart always --cap-add=NET_ADMIN --device=/dev/net/tun --network=hive -v /etc/docker-hive/vpn:/etc/snet' + ports + ' newtoncodes/hive-snet:' + version,
                {stdio: ['pipe', 'pipe', 'pipe']}
            );
        } catch (e) {
            console.log('Failed to start snet service.');
            return;
        }
    
        exec('docker stack deploy --compose-file /etc/docker-hive/stack.yml --with-registry-auth hive', {stdio: 'inherit'});
        
        console.log('Hive started.');
    }
    
    async stop() {
        this._checkMaster();
    
        console.log('Stopping hive...');
    
        console.log('Removing service hive_snet');
        rmContainer('hive_snet');
        
        let ls = (exec('docker stack ls') || '')['toString']('utf8').trim();
        
        if (ls.match(/(^|\n|\s)hive(\s|\n)/m)) {
            exec('docker stack rm hive', {stdio: 'inherit'});
        }
    
        rmContainer('hive_portainer');
        rmContainer('hive_prometheus');
        rmContainer('hive_prometheus_rules');
        rmContainer('hive_alertmanager');
        rmContainer('hive_export-cadvisor');
        rmContainer('hive_export-dockerd');
        rmContainer('hive_export-node');
        rmContainer('hive_unsee');
        rmContainer('hive_grafana');
        
        console.log('Hive stopped.');
    }
    
    async restart() {
        this._checkMaster();
    
        await this.stop();
        await this.start();
    }
    
    async addNode(ip) {
        this._checkMaster();
    
        ip = await askIp(ip);
        
        if (!ip.match(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)) {
            throw new Error('Invalid ip address: ' + ip);
        }
        
        let nodes = getNodes();
        nodes.push(ip);
        saveNodes(nodes);
        
        console.log('Node added.');
        
        if (this._config.iptablesCallback) {
            try {
                exec(this._config.iptablesCallback);
            } catch (e) {
                return console.error('Error executing iptables callback: ' + this._config.iptablesCallback);
            }
        }
    }
    
    async rmNode(ip) {
        this._checkMaster();
    
        ip = await askIp(ip);
        
        let nodes = getNodes();
        let i = nodes.indexOf(ip);
        while (i !== -1) {
            nodes.splice(i, 1);
            i = nodes.indexOf(ip);
        }
    
        saveNodes(nodes);
    
        console.log('Node removed.');
    
        if (this._config.iptablesCallback) {
            try {
                exec(this._config.iptablesCallback);
            } catch (e) {
                return console.error('Error executing iptables callback: ' + this._config.iptablesCallback);
            }
        }
    }
    
    async lsNodes() {
        let nodes = getNodes();
        console.log(nodes.join('\n'));
    }
    
    async sync() {
        this._checkManagerWorker();
        
        let sync = async () => {
            let rule = this.getIptables();
            let nodes = null;
            
            try {
                nodes = await Utils.post(this._host, 4876, '/nodes', this._config.apiKey);
            } catch (e) {
                nodes = null;
            }
            
            if (!nodes) {
                setTimeout(() => sync().then(() => {}).catch(() => {}), 5000);
                return console.error('Sync error: Cannot connect to server.');
            }
    
            try {
                nodes = Utils.decrypt(nodes, this._config.apiSecret);
                nodes = JSON.parse(nodes);
            } catch (e) {
                nodes = null;
            }
    
            if (!nodes) {
                setTimeout(() => sync().then(() => {}).catch(() => {}), 5000);
                return console.error('Sync error: Cannot parse server message.');
            }
    
            try {
                saveNodes(nodes);
            } catch (e) {
                setTimeout(() => sync().then(() => {}).catch(() => {}), 5000);
                return console.error('Sync error: Cannot save nodes.');
            }
            
            let rule2 = this.getIptables();
    
            if (rule !== rule2 && this._config.iptablesCallback) {
                try {
                    exec(this._config.iptablesCallback);
                } catch (e) {
                    setTimeout(() => sync().then(() => {}).catch(() => {}), 5000);
                    return console.error('Error executing iptables callback: ' + this._config.iptablesCallback);
                }
            }
            
            setTimeout(() => sync().then(() => {}).catch(() => {}), 5000);
        };
        
        sync().then(() => {}).catch(() => {});
    }
    
    async serve() {
        this._checkMaster();
        
        this._server = http.createServer((request, response) => {
            let url = request.url.split('/');
            let path = url[url.length - 1];
            
            if (request.method !== 'POST') {
                response.writeHead(403);
                response.end();
                return;
            }
            
            let body = '';
            request.on('data', data => body += data);
            request.on('end', () => {
                if (body !== this._config.apiKey) {
                    response.writeHead(403);
                    response.end();
                    return;
                }
                
                try {
                    if (path === 'nodes') {
                        response.writeHead(200);
                        response.end(Utils.encrypt(JSON.stringify([this._host].concat(getNodes())), this._config.apiSecret));
                    }
                    else if (path === 'token-worker') {
                        response.writeHead(200);
                        response.end(Utils.encrypt(JSON.stringify(getToken('worker')), this._config.apiSecret));
                    }
                    else if (path === 'token-manager') {
                        response.writeHead(200);
                        response.end(Utils.encrypt(JSON.stringify(getToken('manager')), this._config.apiSecret));
                    }
                    else {
                        response.writeHead(403);
                        response.end();
                    }
                } catch (e) {
                    response.end();
                }
            });
        });
    
        await new Promise((resolve, reject) => {
            this._server.listen(4876, error => {
                if (error) return reject(error);
                console.log('Listening...');
                resolve();
            });
        });
    }
    
    async showIptables(file) {
        let rule = this.getIptables();
        if (file) writeFile(file, rule + '\n');
        else console.log(rule);
    }
    
    getIptables() {
        let nodes = getNodes();
        let iface = this._config.iface;
        
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

iptables -A OUTPUT -p tcp --sport 2376 -j ACCEPT
iptables -A OUTPUT -p tcp --sport 2377 -j ACCEPT
iptables -A OUTPUT -p tcp --sport 7946 -j ACCEPT
iptables -A OUTPUT -p udp --sport 7946 -j ACCEPT
iptables -A OUTPUT -p udp --sport 4789 -j ACCEPT

# Dockerd metrics

iptables -A INPUT  -p tcp -i docker_gwbridge --dport 9323 -m state --state NEW,ESTABLISHED -j ACCEPT
iptables -A OUTPUT -p tcp --sport 9323 -j ACCEPT

# Nodes
`;
    
        for (let ip of nodes) {
            rule += `
iptables -A INPUT  -p tcp -s "${ip}" -i ${iface} --dport 2376 -j ACCEPT
iptables -A INPUT  -p tcp -s "${ip}" -i ${iface} --dport 2377 -j ACCEPT
iptables -A INPUT  -p tcp -s "${ip}" -i ${iface} --dport 7946 -j ACCEPT
iptables -A INPUT  -p udp -s "${ip}" -i ${iface} --dport 7946 -j ACCEPT
iptables -A INPUT  -p udp -s "${ip}" -i ${iface} --dport 4789 -j ACCEPT

iptables -A OUTPUT -p tcp -d "${ip}" --sport 2376 -j ACCEPT
iptables -A OUTPUT -p tcp -d "${ip}" --sport 2377 -j ACCEPT
iptables -A OUTPUT -p tcp -d "${ip}" --sport 7946 -j ACCEPT
iptables -A OUTPUT -p udp -d "${ip}" --sport 7946 -j ACCEPT
iptables -A OUTPUT -p udp -d "${ip}" --sport 4789 -j ACCEPT
`;
            
            if (this._type === 'master') {
                rule += `iptables -A INPUT  -p tcp -s "${ip}" -i ${iface} --dport 4876 -j ACCEPT\n`;
                rule += `iptables -A OUTPUT -p tcp -d "${ip}" --dport 4876 -j ACCEPT\n`;
            }
        }
    
        return rule;
    }
    
    _checkMaster() {
        if (this._type !== 'master') throw new Error('You can only do this on the master machine.');
    }
    
    _checkManagerWorker() {
        if (this._type === 'master') throw new Error('You cannot do this on the master machine.');
    }
}

const askIp = async (initial) => {
    return await Utils.ask(`Public IPv4 address of the node: `, n => {
        return (n && !!n.match(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/));
    }, initial);
};

const getNodes = () => {
    if (!exists('/etc/docker-hive/nodes')) return [];
    
    return readFile('/etc/docker-hive/nodes', 'utf8').trim().split('\n').filter(ip => {
        return !!ip.match(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/);
    });
};

const saveNodes = (nodes) => {
    writeFile('/etc/docker-hive/nodes', nodes.join('\n'));
};

const getToken = (type) => {
    let o = (exec('docker swarm join-token ' + type, {stdio: ['pipe', 'pipe', 'pipe']}) || '')['toString']('utf8');
    let oo = o.match(/docker swarm join --token ([^\s]+) ([^:]+):(\d+)/);
    if (!oo) throw new Error('Could not get the token.');
    
    // let token = oo[1];
    // let host = oo[2];
    // let port = oo[3];
    
    return oo[1];
};

let stopContainer = (name) => {
    try {
        exec(`docker stop $(docker ps -aq --filter="name=${name}")`, {stdio: ['pipe', 'pipe', 'pipe']});
    } catch (e) {
        if (e.stderr['toString']('utf8').indexOf('requires at least 1 argument.') > 0) {
            return;
        }
        
        throw new Error('Could not stop container: ' + name);
    }
};

let rmContainer = (name) => {
    stopContainer(name);
    
    try {
        exec(`docker rm -v $(docker ps -aq --filter="name=${name}")`, {stdio: ['pipe', 'pipe', 'pipe']});
    } catch (e) {
        if (e.stderr['toString']('utf8').indexOf('requires at least 1 argument.') > 0) {
            return;
        }
        
        throw new Error('Could not remove container: ' + name);
    }
};


module.exports = Hive;