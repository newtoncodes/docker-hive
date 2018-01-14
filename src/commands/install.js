'use strict';

const os = require('os');
const execSync = require('child_process').execSync;
const {
    writeFile, mkdir,
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
}

let stopContainer = (name) => {
    let id = getContainerId(name);
    if (!id) return;
    
    execSync('docker stop ' + id);
}

let rmContainer = (name) => {
    let id = getContainerId(name);
    
    if (!id) {
        try { execSync('docker rm ' + id); } catch (e) {}
        return;
    }
    
    try { execSync('docker stop ' + id); } catch (e) {}
    try { execSync('docker rm ' + id); }
    catch (e) {
        throw new Error('Could not remove container "' + name + '"');
    }
}

let getContainerId = (name) => {
    let id = '';
    
    try {
        id = (execSync('docker ps -a -q --filter="name=' + name + '"') || '')['toString']('utf8').trim();
    } catch (e) {
        id = '';
    }
    
    return id;
}

let rmContainers = () => {
    createVolume('hive_portainer');
    createVolume('hive_alertmanager');
    createVolume('hive_export-cadvisor');
    createVolume('hive_grafana');
    createVolume('hive_grafana-log');
    createVolume('hive_grafana-etc');
}

let createVolume = (name) => {
    if (existsVolume(name)) throw new Error('Volume "' + name + '" already exists.');

    try {
        exec('docker volume create ' + name);
    } catch (e) {
        throw new Error('Could not create volume "' + name + '"');
    }
}

let rmVolume = (name) => {
    if (!existsVolume(name)) return;
    
    try {
        exec('docker volume rm ' + name);
    } catch (e) {
        throw new Error('Could not remove volume "' + name + '"');
    }
}

let existsVolume = (name) => {
    let id = '';
    
    try {
        id = (execSync('volume ls -q --filter="name=' + name + '"') || '')['toString']('utf8').trim();
    } catch (e) {
        id = '';
    }
    
    return id.length > 0;
}

let createVolumes = () => {
    createVolume('hive_portainer');
    createVolume('hive_prometheus-alertmanager');
    createVolume('hive_prometheus');
    createVolume('hive_grafana');
    createVolume('hive_grafana-log');
    createVolume('hive_grafana-etc');
}

let rmVolumes = () => {
    rmVolume('hive_portainer');
    rmVolume('hive_prometheus-alertmanager');
    rmVolume('hive_prometheus');
    rmVolume('hive_grafana');
    rmVolume('hive_grafana-log');
    rmVolume('hive_grafana-etc');
}

const installer = {
    join: async (host, token) => {
        host = askHost(host);
        token = askToken(token);
        
        mkdir('/etc/docker-hive');
        writeFile('/etc/docker-hive/vars.env', `
HOST="${host}"
TOKEN="${token}"
`);
        
        exec('docker swarm join --token "' + token + '" "' + host + ':2377"');
        
        await updateDockerConfig();
    },
    
    init: async () => {
        let adminUsername = askAdminUsername();
        let adminPassword = askAdminPassword();
    
        let slackKey = askSlackKey();
        let slackChannel = askSlackChannel();
        let slackUsername = askSlackUsername();
        let publishPorts = askPublishPorts();
        
        mkdir('/etc/docker-hive');
        writeFile('/etc/docker-hive/vars.env', `
ADMIN_USERNAME="${adminUsername}"
ADMIN_PASSWORD="${adminPassword}"

SLACK_KEY="${slackKey}"
SLACK_CHANNEL="${slackChannel}"
SLACK_USERNAME="${slackUsername}"

PUBLISH="${publishPorts}"
`);
        
        exec('docker swarm init');
        
        exec('docker network create --attachable -d overlay hive');
        
    
        await updateDockerConfig();
    },
    
    leave: async () => {
        exec('docker stack rm hive');
        rmContainers()
        
        exec('docker volume rm hive-portainer');
        exec('docker volume rm hive-prometheus-alertmanager');
        exec('docker volume rm hive-prometheus');
        exec('docker volume rm hive-grafana');
        exec('docker volume rm hive-grafana-log');
        exec('docker volume rm hive-grafana-etc');
    },
    
    reinstall: async () => {
        exec('docker volume rm hive-portainer');
        exec('docker volume rm hive-prometheus-alertmanager');
        exec('docker volume rm hive-prometheus');
        exec('docker volume rm hive-grafana');
        exec('docker volume rm hive-grafana-log');
        exec('docker volume rm hive-grafana-etc');
        
    }
};


module.exports = installer;