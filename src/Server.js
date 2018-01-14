'use strict';

const http = require('http');
const os = require('os');
const execSync = require('child_process').execSync;
const {getNodes} = require('./lib');


class Server {
    constructor() {
        this._server = http.createServer((request, response) => {
            response.end(JSON.stringify(getNodes()));
        });
    }
    
    async start() {
        if (this._started) return;
        this._started = true;
        
        let i = () => {
            this._tick().then(() => {
                this._to = setTimeout(i, 1000);
            }).catch(e => {
                throw e;
            });
        };
    
        this._to = setTimeout(i, 1000);
    }
    
    async stop() {
        if (!this._started) return;
        this._started = false;
    
        clearTimeout(this._to);
        this._server.close();
    }
    
    async _tick() {
        if (!this._started) return;
    
        let hasNw = !!os.networkInterfaces()['docker_gwbridge'];
        let host = null;
        
        if (hasNw) {
            if (this._listening) return;
            host = await getHostIp();
        }
        
        if (host) {
            if (this._listening) return;
    
            await new Promise((resolve, reject) => {
                this._listening = true;
                this._server.listen(4876, host, error => {
                    if (error) return reject(error);
                    console.log('Listening...');
                    resolve();
                });
            });
        } else {
            if (!this._listening) return;
    
            this._listening = false;
            this._server.close();
            console.log('Closed.');
        }
    }
}

const getHostIp = async () => {
    let hostIp = null;
    
    try {
        hostIp = execSync('cut -d\'/\' -f1 <<< `ip -o addr show docker_gwbridge | awk \'{print $4}\'`');
    } catch (e) {
        hostIp = null;
    }
    
    return hostIp;
};


module.exports = Server;
