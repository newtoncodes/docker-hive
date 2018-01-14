#!/usr/bin/env node

'use strict';

const exec = require('child_process').execSync;
const yargs = require('yargs');

const {isWritable, exists} = require('../src/lib');
const sync = require('../src/commands/sync').sync;
const nodeAdd = require('../src/commands/nodes').add;
const nodeRm = require('../src/commands/nodes').rm;
const nodeList = require('../src/commands/nodes').list;
const start = require('../src/commands/start').start;
const stop = require('../src/commands/stop').stop;
const iptables = require('../src/commands/iptables').iptables;


const options = {
    cmd: {
        name: 'cmd',
        description: 'Node command.',
        type: 'string',
        choices: ['add', 'rm', 'ls'],
        default: 'ls'
    },
    
    ip: {
        name: 'ip',
        description: 'Node IP address.',
        type: 'string',
        
        coerce: (ip) => {
            ip = ip.trim().toLowerCase();
    
            if (ip && !ip.match(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)) {
                throw new Error('Invalid client ip.');
            }
            
            return ip;
        }
    },
    
    save: {
        alias: 's',
        description: 'Save to file',
        type: 'string'
    },
    
    interface: {
        alias: 'i',
        description: 'Public network interface to allow.',
        type: 'string'
    }
};

const resolve = (promise, cb = () => process.exit(0), cmd) => {
    checkRoot();
    if (cmd !== 'install' && cmd !== 'install-dependencies') checkInstall();
    
    return promise.then(cb).catch(e => {
        e.message && console.error('Error: ' + e.message);
        process.exit(1);
    });
};

const checkRoot = () => {
    if (!isWritable('/etc')) {
        console.error('Please run as root or use sudo.');
        process.exit(1);
    }
};

const checkInstall = () => {
    if (!exists('/etc/docker-hive/vars.env')) {
        console.error(`Please run hive install.`);
        process.exit(1);
    }
};



const commands = {
    nodeAdd: {
        command: 'node add [ip]',
        description: 'Allow node to connect.',
        
        builder: (yargs) => yargs
            .positional('cmd', options.cmd)
            .positional('ip', options.ip),
        
        handler: (argv) => resolve(nodeAdd(argv.cmd, argv.ip))
    },
    nodeRm: {
        command: 'node rm [ip]',
        description: 'Remove node from the allowed list.',
        
        builder: (yargs) => yargs
            .positional('cmd', options.cmd)
            .positional('ip', options.ip),
        
        handler: (argv) => resolve(nodeRm(argv.cmd, argv.ip))
    },
    nodeList: {
        command: 'node ls [ip]',
        description: 'List the allowed nodes.',
        
        builder: (yargs) => yargs
            .positional('cmd', options.cmd)
            .positional('ip', options.ip),
        
        handler: (argv) => resolve(nodeList(argv.cmd, argv.ip))
    },
    start: {
        command: 'start',
        description: 'Start the hive stack.',
    
        builder: (yargs) => yargs,
    
        handler: () => resolve(start())
    },
    stop: {
        command: 'stop',
        description: 'Stop the hive stack.',
    
        builder: (yargs) => yargs,
    
        handler: () => resolve(stop())
    },
    restart: {
        command: 'restart',
        description: 'Restart the hive stack.',
    
        builder: (yargs) => yargs,
    
        handler: () => resolve(stop(), () => resolve(start()))
    },
    iptables: {
        command: 'iptables [-i <interface>] [-s <file>]',
        description: 'Print all iptables accept rules.',
        
        builder: (yargs) => yargs
            .positional('interface', options.interface)
            .positional('save', options.save),
        
        handler: (argv) => resolve(iptables(argv.interface, argv.save))
    },
    install: {
        command: 'install',
        description: 'Install dependencies (Ubuntu/Debian).',
        
        builder: (yargs) => yargs,
        
        handler: () => {
            exec('bash ' + __dirname + '/install.sh', {stdio: 'inherit'});
            process.exit(0);
        }
    },
    sync: {
        command: 'sync',
        description: 'Sync config with the master node.',
        
        builder: (yargs) => yargs,
        
        handler: () => resolve(sync())
    },
    config: {
        command: 'config',
        description: 'Edit the config with nano.',
        
        builder: (yargs) => yargs,
    
        handler: () => {
            exec('nano /etc/docker-hive/vars.env', {stdio: 'inherit'});
            process.exit(0);
        }
    },
    tokenWorker: {
        command: 'token worker',
        description: 'Get the worker join token.',
        
        builder: (yargs) => yargs,
        
        handler: () => {
            let o = (exec('docker swarm join-token worker') || '')['toString']('utf8');
            let oo = o.match(/docker swarm join --token ([^\s]+) ([^:]+):(\d+)/);
            if (!oo) {
                console.error('Could not get the token.');
                process.exit(1);
            }
    
            let token = oo[1];
            let host = oo[2];
            // let port = oo[3];
    
            console.log(`hive join ${host} ${token}`);
            process.exit(0);
        }
    },
    tokenManager: {
        command: 'token manager',
        description: 'Get the manager join token.',
        
        builder: (yargs) => yargs,
        
        handler: () => {
            let o = (exec('docker swarm join-token manager') || '')['toString']('utf8');
            let oo = o.match(/docker swarm join --token ([^\s]+) ([^:]+):(\d+)/);
            if (!oo) {
                console.error('Could not get the token.');
                process.exit(1);
            }
            
            let token = oo[1];
            let host = oo[2];
            // let port = oo[3];
    
            console.log(`hive join ${host} ${token}`);
            process.exit(0);
        }
    }
};


yargs
    .wrap(null)
    .usage('Full-stack docker-swarm management.\n\nUsage: $0 <cmd> <args ...>')
    .demandCommand(1, 1, 'You must specify a command.', 'You must specify max one command.')
    
    .command(commands['install'])
    .command(commands['config'])
    .command(commands['tokenManager'])
    .command(commands['tokenWorker'])
    
    .command(commands['start'])
    .command(commands['stop'])
    .command(commands['restart'])
    
    .command(commands['nodeAdd'])
    .command(commands['nodeRm'])
    .command(commands['nodeList'])
    
    .command(commands['sync'])
    
    .command(commands['iptables'])
    .command(commands['install'])
    .help();

if (!commands[yargs.argv['_'][0]]) {
    yargs.showHelp('log');
    process.exit();
}
