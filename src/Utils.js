'use strict';

const http = require('http');
const crypto = require('crypto');
const exists = require('fs').existsSync;
const readline = require('readline');
const W_OK = require('fs').W_OK;
const access = require('fs').accessSync;
const dirname = require('path').dirname;
readline.rli = readline.rli || readline.createInterface({input: process.stdin, output: process.stdout});
const ask = require('util').promisify((q, c) => readline.rli.question(q, a => c(null, a)));

let interfaces = [];
let ni = require('os').networkInterfaces();
for (let i in ni) {
    if (i === 'lo' || i.indexOf('br-') === 0 || i.indexOf('vethae') === 0 || i.match(/^tun\d+$/)) continue;
    interfaces.push(i);
}


const lib = {
    ask: async (question, validate, initial, default_) => {
        if (initial !== undefined && validate(initial)) return initial;
        
        let a = null;
        while (a === null || !validate(a)) {
            a = ((await ask(question)) || '').trim();
            if (a === '' && default_ !== undefined) a = default_;
        }
        
        return a;
    },
    
    post: async (host, path, data) => {
        await new Promise((resolve, reject) => {
            let responded = false;
            let result = '';
            
            let request = http.request({
                host: host,
                port: 80,
                path: path,
                method: 'POST'
            }, res => {
                if (responded) return;
                
                res['setEncoding']('utf8');
                res.on('data', chunk => {
                    if (responded) return;
                    result += chunk;
                    console.log(chunk);
                });
                res.on('end', () => {
                    if (responded) return;
                    responded = true;
                    resolve(result);
                });
            });
            
            request.on('error', e => {
                if (responded) return;
                responded = true;
                reject(e.message);
            });
            
            request.write(data);
            request.end();
        });
    },
    
    get: async (host, path) => {
        await new Promise((resolve, reject) => {
            let responded = false;
            let result = '';
            
            let request = http.request({
                host: host,
                port: 80,
                path: path,
                method: 'GET'
            }, res => {
                if (responded) return;
                
                res['setEncoding']('utf8');
                res.on('data', chunk => {
                    if (responded) return;
                    result += chunk;
                    console.log(chunk);
                });
                res.on('end', () => {
                    if (responded) return;
                    responded = true;
                    resolve(result);
                });
            });
            
            request.on('error', e => {
                if (responded) return;
                responded = true;
                reject(e.message);
            });
            
            request.end();
        });
    },
    
    encrypt: (text, password) => {
        let cipher = crypto.createCipher('aes-256-ctr', password);
        let encrypted = cipher.update(text,'utf8','hex');
        encrypted += cipher['final']('hex');
        
        return encrypted;
    },
    
    decrypt: (text, password) => {
        let decipher = crypto.createDecipher('aes-256-ctr', password);
        let dec = decipher.update(text,'hex','utf8');
        dec += decipher['final']('utf8');
        
        return dec;
    },
    
    isWritable: (file) => {
        try {
            if (exists(file)) access(file, W_OK);
            else access(dirname(file), W_OK);
        } catch (e) {
            return false;
        }
        
        return true;
    }
};


module.exports = lib;