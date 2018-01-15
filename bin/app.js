#!/usr/bin/env node

'use strict';

const exec = require('child_process').execSync;
const exists = require('fs').existsSync;
const yargs = require('yargs');

const isWritable = require('../src/Utils').isWritable;
const Installer = require('../src/Installer');
const Hive = require('../src/Hive');


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
    
    type: {
        alias: 't',
        description: 'Node type',
        choices: ['manager', 'worker'],
        type: 'string'
    },
    
    host: {
        alias: 'h',
        description: 'Host ip address to advertise.',
        type: 'string',
    
        coerce: (ip) => {
            ip = ip.trim().toLowerCase();
        
            if (ip && !ip.match(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)) {
                throw new Error('Invalid client ip.');
            }
        
            return ip;
        }
    },
    
    iface: {
        alias: 'i',
        description: 'Host interface to advertise.',
        type: 'string'
    },
};

const resolve = (fn, cb = () => process.exit(0)) => {
    checkRoot();
    
    let promise = null;
    
    try {
        promise = fn();
    } catch (e) {
        e.message && console.error('Error: ' + e.message);
        process.exit(1);
    }
    
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


const commands = {
    nodeAdd: {
        command: 'node add [ip]',
        description: 'Allow node to connect.',
        
        builder: (yargs) => yargs
            .positional('ip', options.ip),
        
        handler: (argv) => resolve(() => (new Hive()).addNode(argv.ip))
    },
    nodeRm: {
        command: 'node rm [ip]',
        description: 'Remove node from the allowed list.',
        
        builder: (yargs) => yargs
            .positional('ip', options.ip),
    
        handler: (argv) => resolve(() => (new Hive()).rmNode(argv.ip))
    },
    nodeList: {
        command: 'node ls',
        description: 'List the allowed nodes.',
        
        builder: (yargs) => yargs,
    
        handler: () => resolve(() => (new Hive()).lsNodes())
    },
    init: {
        command: 'init [-h <host>] [-i <interface>]',
        description: 'Create a new docker swarm.',
        
        builder: (yargs) => yargs
            .positional('host', options.host)
            .positional('iface', options.iface),
    
        handler: (argv) => resolve(() => (new Installer()).init(argv.host, argv.iface))
    },
    join: {
        command: 'join [-t <type>] [-h <host>] [-i <interface>]',
        description: 'Join a docker swarm (manager by hive).',
        
        builder: (yargs) => yargs
            .positional('type', options.type)
            .positional('host', options.host)
            .positional('iface', options.iface),
        
        handler: (argv) => resolve(() => (new Installer()).join(argv.type, argv.host, argv.iface))
    },
    leave: {
        command: 'leave',
        description: 'Leave the current swarm.',
        
        builder: (yargs) => yargs,
        
        handler: () => resolve(() => (new Installer()).leave())
    },
    reset: {
        command: 'reset',
        description: 'Join to a docker swarm (manager by hive).',
        
        builder: (yargs) => yargs,
        
        handler: () => resolve(() => (new Installer()).reset())
    },
    start: {
        command: 'start',
        description: 'Start the hive stack.',
    
        builder: (yargs) => yargs,
    
        handler: () => resolve(() => (new Hive()).start())
    },
    stop: {
        command: 'stop',
        description: 'Stop the hive stack.',
    
        builder: (yargs) => yargs,
    
        handler: () => resolve(() => (new Hive()).stop())
    },
    restart: {
        command: 'restart',
        description: 'Restart the hive stack.',
    
        builder: (yargs) => yargs,
    
        handler: () => resolve(() => (new Hive()).restart())
    },
    iptables: {
        command: 'iptables [-s <file>]',
        description: 'Print all iptables accept rules.',
        
        builder: (yargs) => yargs
            .positional('save', options.save),
    
        handler: (argv) => resolve(() => (new Hive()).showIptables(argv.save))
    },
    config: {
        command: 'config',
        description: 'Edit the config with nano.',
        
        builder: (yargs) => yargs,
    
        handler: () => {
            if (!exists('/etc/docker-hive') || !exists('/etc/docker-hive/hive.conf') || !exists('/etc/docker-hive/env.conf')) {
                console.error('Error: Hive is not installed. Please run hive install first.');
                process.exit(1);
            }
            
            exec('nano /etc/docker-hive/hive.conf', {stdio: 'inherit'});
            process.exit(0);
        }
    },
    sync: {
        command: 'sync',
        description: 'Sync config with the master node.',
        
        builder: (yargs) => yargs,
    
        handler: () => resolve(() => (new Hive()).sync())
    },
    serve: {
        command: 'serve',
        description: 'Serve config to the worker/manager nodes.',
        
        builder: (yargs) => yargs,
    
        handler: () => resolve(() => (new Hive()).serve())
    },
    dependencies: {
        command: 'install-dependencies',
        description: 'Install dependencies (Ubuntu/Debian).',
        
        builder: (yargs) => yargs,
        
        handler: () => {
            exec('bash ' + __dirname + '/install.sh', {stdio: 'inherit'});
            process.exit(0);
        }
    },
};


yargs
    .wrap(null)
    .usage('Full-stack docker-swarm management.\n\nUsage: $0 <cmd> <args ...>')
    .demandCommand(1, 1, 'You must specify a command.', 'You must specify max one command.')
    
    .command(commands['init'])
    .command(commands['join'])
    .command(commands['leave'])
    .command(commands['reset'])
    .command(commands['config'])
    
    .command(commands['start'])
    .command(commands['stop'])
    .command(commands['restart'])
    
    .command(commands['nodeAdd'])
    .command(commands['nodeRm'])
    .command(commands['nodeList'])
    
    .command(commands['serve'])
    .command(commands['sync'])
    
    .command(commands['iptables'])
    .command(commands['dependencies'])
    .help();

if (!commands[yargs.argv['_'][0]]) {
    yargs.showHelp('log');
    process.exit();
}
