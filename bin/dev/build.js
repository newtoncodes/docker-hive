'use strict';

const execSync = require('child_process').execSync;
const exec = (cmd) => (execSync(cmd, {stdio: 'inherit'}) || '')['toString']('utf8');
const version = require('../../package.json').version;


__dirname = __dirname.replace(/\\/g, '/');

exec('cd ' + __dirname + '/../../docker/grafana && docker build -t newtoncodes/hive-grafana .');
exec('cd ' + __dirname + '/../../docker/grafana && docker build -t newtoncodes/hive-grafana:' + version + ' .');

exec('cd ' + __dirname + '/../../docker/portainer && docker build -t newtoncodes/hive-portainer .');
exec('cd ' + __dirname + '/../../docker/portainer && docker build -t newtoncodes/hive-portainer:' + version + ' .');

exec('cd ' + __dirname + '/../../docker/prometheus && docker build -t newtoncodes/hive-prometheus .');
exec('cd ' + __dirname + '/../../docker/prometheus && docker build -t newtoncodes/hive-prometheus:' + version + ' .');

exec('cd ' + __dirname + '/../../docker/prometheus-alertmanager && docker build -t newtoncodes/hive-prometheus-alertmanager .');
exec('cd ' + __dirname + '/../../docker/prometheus-alertmanager && docker build -t newtoncodes/hive-prometheus-alertmanager:' + version + ' .');

exec('cd ' + __dirname + '/../../docker/prometheus-export-cadvisor && docker build -t newtoncodes/hive-prometheus-export-cadvisor .');
exec('cd ' + __dirname + '/../../docker/prometheus-export-cadvisor && docker build -t newtoncodes/hive-prometheus-export-cadvisor:' + version + ' .');

exec('cd ' + __dirname + '/../../docker/prometheus-export-dockerd && docker build -t newtoncodes/hive-prometheus-export-dockerd .');
exec('cd ' + __dirname + '/../../docker/prometheus-export-dockerd && docker build -t newtoncodes/hive-prometheus-export-dockerd:' + version + ' .');

exec('cd ' + __dirname + '/../../docker/prometheus-export-node && docker build -t newtoncodes/hive-prometheus-export-node .');
exec('cd ' + __dirname + '/../../docker/prometheus-export-node && docker build -t newtoncodes/hive-prometheus-export-node:' + version + ' .');

exec('cd ' + __dirname + '/../../docker/snet && docker build -t newtoncodes/hive-snet .');
exec('cd ' + __dirname + '/../../docker/snet && docker build -t newtoncodes/hive-snet:' + version + ' .');

exec('cd ' + __dirname + '/../../docker/unsee && docker build -t newtoncodes/hive-unsee .');
exec('cd ' + __dirname + '/../../docker/unsee && docker build -t newtoncodes/hive-unsee:' + version + ' .');

console.log('Done.');
process.exit(0);