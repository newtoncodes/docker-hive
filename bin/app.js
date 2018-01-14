#!/usr/bin/env node

'use strict';

const exec = require('child_process').execSync;
const yargs = require('yargs');

const workerAdd = require('../src/commands/worker').add;
const workerRm = require('../src/commands/worker').rm;
const nodeAdd = require('../src/commands/node').add;
const nodeRm = require('../src/commands/node').rm;
const start = require('../src/commands/start').start;
const stop = require('../src/commands/stop').stop;
const iptables = require('../src/commands/iptables').iptables;


const options = {
    server: {
        name: 'server',
        description: 'Server name/key.',
        type: 'string',
        
        coerce: (server) => {
            server = server.trim().toLowerCase();
            if (!server) throw new Error('Invalid server name.');
            
            // if (!exists('/var/lib/docker/volumes/vpn_' + server)) {
            //     throw new Error('Server "' + server + '" does not exist.');
            // }
            
            return server;
        }
    },
    
    client: {
        name: 'client',
        description: 'Client name/key.',
        type: 'string',
        
        coerce: (name) => {
            name = name.trim().toLowerCase();
            if (!name) throw new Error('Invalid client name.');
            
            return name;
        }
    },
    
    ip: {
        name: 'ip',
        description: 'Client IP address.',
        type: 'string',
        
        coerce: (ip) => {
            ip = ip.trim().toLowerCase();
    
            if (ip && !ip.match(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)) {
                throw new Error('Invalid client ip.');
            }
            
            return ip;
        }
    },
    
    config: {
        name: 'config',
        description: 'Config type.',
        type: 'string',
        choices: ['server', 'client', 'hosts', 'vars'],
        default: 'server'
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

const resolve = (promise, cb = () => process.exit(0)) => {
    return promise.then(cb).catch(e => {
        e.message && console.error('Error: ' + e.message);
        process.exit(1);
    });
};


const commands = {
    workerAdd: {
        command: 'worker add [ip]',
        description: 'Allow worker to connect.',
        
        builder: (yargs) => yargs
            // .positional('cmd', options.cmd)
            .positional('ip', options.ip),
        
        handler: (argv) => resolve(workerAdd(argv.ip))
    },
    workerRm: {
        command: 'worker rm [ip]',
        description: 'Remove worker from the allowed list.',
        
        builder: (yargs) => yargs
            // .positional('cmd', options.cmd)
            .positional('ip', options.ip),
        
        handler: (argv) => resolve(workerRm(argv.ip))
    },
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
    dependencies: {
        command: 'install-dependencies',
        description: 'Install dependencies (Ubuntu/Debian).',
        
        builder: (yargs) => yargs,
        
        handler: () => {
            exec('bash ' + __dirname + '/install.sh', {stdio: 'inherit'});
            process.exit(0);
        }
    }
};


yargs
    .wrap(null)
    .usage('Full-stack docker-swarm management.\n\nUsage: $0 <cmd> <args ...>')
    .demandCommand(1, 1, 'You must specify a command.', 'You must specify max one command.')
    
    .command(commands['start'])
    .command(commands['stop'])
    .command(commands['restart'])
    
    .command(commands['nodeAdd'])
    .command(commands['nodeRm'])
    .command(commands['nodeRm'])
    
    .command(commands['workerAdd'])
    .command(commands['workerRm'])
    
    .command(commands['iptables'])
    .command(commands['dependencies'])
    .help();

if (!commands[yargs.argv['_'][0]]) {
    yargs.showHelp('log');
    process.exit();
}
