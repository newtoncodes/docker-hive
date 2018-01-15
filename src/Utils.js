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
    
    post: async (host, port, path, data) => {
        return await new Promise((resolve, reject) => {
            let responded = false;
            let result = '';
            
            let request = http.request({
                host: host,
                port: port,
                path: path,
                method: 'POST'
            }, res => {
                if (responded) return;
                
                res['setEncoding']('utf8');
                res.on('data', chunk => {
                    if (responded) return;
                    result += chunk;
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
    
    get: async (host, port, path) => {
        return await new Promise((resolve, reject) => {
            let responded = false;
            let result = '';
            
            let request = http.request({
                host: host,
                port: port,
                path: path,
                method: 'GET'
            }, res => {
                if (responded) return;
                
                res['setEncoding']('utf8');
                res.on('data', chunk => {
                    if (responded) return;
                    result += chunk;
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
        try {
            let iv = crypto.randomBytes(12);
            let salt = crypto.randomBytes(64);
            let key = crypto.pbkdf2Sync(password, salt, 2145, 32, 'sha512');
            let cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
            let encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
            let tag = cipher.getAuthTag();
            
            return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
        } catch(e) {}
        
        return null;
    },
    
    decrypt: (data, password) => {
        try {
            let bData = new Buffer(data, 'base64');
            
            let salt = bData.slice(0, 64);
            let iv = bData.slice(64, 76);
            let tag = bData.slice(76, 92);
            let text = bData.slice(92);
            
            let key = crypto.pbkdf2Sync(password, salt , 2145, 32, 'sha512');
            
            let decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
            decipher.setAuthTag(tag);
            
            return decipher.update(text, 'binary', 'utf8') + decipher.final('utf8');
        } catch(e) {}
        
        return null;
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