'use strict';

const os = require('os');
const execSync = require('child_process').execSync;
const {
    writeFile, mkdir, exists, unlink,
    askHost, askToken, askAdminUsername, askAdminPassword, askSlackKey, askSlackChannel, askSlackUsername, askPublishPorts
} = require('../lib');


let updateDockerConfig = async () => {
    while (!os.networkInterfaces()['docker_gwbridge']) {
        await new Promise(resolve => setTimeout(() => resolve(), 1000));
    }
    
    let hostIp = null;
    try {
        hostIp = execSync('cut -d\'/\' -f1 <<< `ip -o addr show docker_gwbridge | awk \'{print $4}\'`');
    } catch (e) {
        hostIp = null;
    }
    
    if (!hostIp) throw new Error('Cannot find docker_gwbridge interface.');
    
    writeFile('/etc/docker/daemon.json', '{"experimental": true, "metrics-addr": "' + hostIp + ':9323"}');
    exec('/etc/init.d/docker restart');
};



let getContainerId = (name) => {
    let id = '';
    
    try {
        id = (execSync('docker ps -a -q --filter="name=' + name + '"') || '')['toString']('utf8').trim();
    } catch (e) {
        id = '';
    }
    
    return id;
};

let stopContainer = (name) => {
    let res = '';
    
    try {
        res = execSync(`docker stop -v $(docker ps -aq --filter="name=${name}")`);
    } catch (e) {
        throw new Error('Could not remove container: ' + name);
    }
    
    if (res.indexOf('"docker stop" requires') !== -1) {
        //
    }
};

let rmContainer = (name) => {
    stopContainer(name);
    
    let res = '';
    
    try {
        res = execSync(`docker rm -v $(docker ps -aq --filter="name=${name}")`);
    } catch (e) {
        throw new Error('Could not remove container: ' + name);
    }
    
    if (res.indexOf('"docker rm" requires') !== -1) {
        //
    }
};

let rmContainers = () => {
    rmContainer('hive_portainer');
    rmContainer('hive_prometheus');
    rmContainer('hive_alertmanager');
    rmContainer('hive_export-cadvisor');
    rmContainer('hive_export-dockerd');
    rmContainer('hive_export-node');
    rmContainer('hive_unsee');
    rmContainer('hive_grafana');
    rmContainer('hive_snet');
};


let existsVolume = (name) => {
    let id = '';
    
    try {
        id = (execSync('docker volume ls -q --filter="name=' + name + '"') || '')['toString']('utf8').trim();
    } catch (e) {
        id = '';
    }
    
    return id.length > 0;
};

let createVolume = (name) => {
    if (existsVolume(name)) throw new Error('Volume "' + name + '" already exists.');

    try {
        exec('docker volume create ' + name);
    } catch (e) {
        throw new Error('Could not create volume "' + name + '"');
    }
};

let rmVolume = (name) => {
    if (!existsVolume(name)) return;
    
    try {
        exec('docker volume rm ' + name);
    } catch (e) {
        throw new Error('Could not remove volume "' + name + '"');
    }
};

let createVolumes = () => {
    createVolume('hive_portainer');
    createVolume('hive_prometheus');
    createVolume('hive_alertmanager');
    createVolume('hive_grafana');
    createVolume('hive_grafana_log');
    createVolume('hive_grafana_etc');
};

let rmVolumes = () => {
    rmVolume('hive_portainer');
    rmVolume('hive_prometheus');
    rmVolume('hive_alertmanager');
    rmVolume('hive_grafana');
    rmVolume('hive_grafana_log');
    rmVolume('hive_grafana_etc');
};


let existsNetwork = (name) => {
    let id = '';
    
    try {
        id = (execSync('docker network ls -q --filter="name=' + name + '"') || '')['toString']('utf8').trim();
    } catch (e) {
        id = '';
    }
    
    return id.length > 0;
};

let createNetwork = (name) => {
    if (existsNetwork(name)) throw new Error('Network "' + name + '" already exists.');
    
    try {
        exec('docker network create --attachable -d overlay ' + name);
    } catch (e) {
        throw new Error('Could not create network "' + name + '"');
    }
};

let rmNetwork = (name) => {
    if (!existsNetwork(name)) return;
    
    try {
        exec('docker network rm ' + name);
    } catch (e) {
        throw new Error('Could not remove network "' + name + '"');
    }
};

let createNetworks = () => {
    createNetwork('hive');
};

let rmNetworks = () => {
    rmNetwork('hive');
};


const installer = {
    init: async () => {
        if (exists('/etc/docker-hive/swarm.env')) throw new Error('Already in a swarm. Run hive leave first.');
    
        let vars = {};
        if (exists('/etc/docker-hive/vars.env')) {
            let vars = getVars();
        }
        
        let adminUsername = askAdminUsername(vars['ADMIN_USERNAME']);
        let adminPassword = askAdminPassword(vars['ADMIN_PASSWORD']);
        let slackKey = askSlackKey(vars['SLACK_KEY']);
        let slackChannel = askSlackChannel(vars['SLACK_CHANNEL']);
        let slackUsername = askSlackUsername(vars['SLACK_USERNAME']);
        let publishPorts = askPublishPorts(vars['PUBLISH']);
        
        writeFile('/etc/docker-hive/vars.env', `
ADMIN_USERNAME="${adminUsername}"
ADMIN_PASSWORD="${adminPassword}"

SLACK_KEY="${slackKey}"
SLACK_CHANNEL="${slackChannel}"
SLACK_USERNAME="${slackUsername}"

PUBLISH="${publishPorts === 'yes' ? '1' : '0'}"
`);
        
        exec('docker swarm init');
    
        createNetworks();
        createVolumes();
        
        await updateDockerConfig();
        
        console.log('Done.');
    },
    
    join: async (host, token) => {
        if (exists('/etc/docker-hive/swarm.env')) throw new Error('Already in a swarm. Run hive leave first.');
        
        host = askHost(host);
        token = askToken(token);
        
        mkdir('/etc/docker-hive');
        writeFile('/etc/docker-hive/swarm.env', `
HOST="${host}"
TOKEN="${token}"
`);
        
        exec('docker swarm join --token "' + token + '" "' + host + ':2377"');
        
        await updateDockerConfig();
        
        console.log('Done.');
    },
    
    leave: async () => {
        rmContainers();
        rmNetworks();
        rmVolumes();
    
        unlink('/etc/docker-hive/swarm.env');
    
        exec('docker swarm leave --force');
    },
    
    reinstall: async () => {
        rmContainers();
        rmNetworks();
        rmVolumes();
    
        createNetworks();
        createVolumes();
    }
};


module.exports = installer;