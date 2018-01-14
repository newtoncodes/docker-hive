'use strict';

const {exec, version} = require('../../src/lib');

require('./build');

exec('docker push newtoncodes/hive-grafana');
exec('docker push newtoncodes/hive-grafana:' + version);

exec('docker push newtoncodes/hive-portainer');
exec('docker push newtoncodes/hive-portainer:' + version);

exec('docker push newtoncodes/hive-prometheus');
exec('docker push newtoncodes/hive-prometheus:' + version);

exec('docker push newtoncodes/hive-prometheus-alertmanager');
exec('docker push newtoncodes/hive-prometheus-alertmanager:' + version);

exec('docker push newtoncodes/hive-prometheus-export-cadvisor');
exec('docker push newtoncodes/hive-prometheus-export-cadvisor:' + version);

exec('docker push newtoncodes/hive-prometheus-export-dockerd');
exec('docker push newtoncodes/hive-prometheus-export-dockerd:' + version);

exec('docker push newtoncodes/hive-prometheus-export-node');
exec('docker push newtoncodes/hive-prometheus-export-node:' + version);

exec('docker push newtoncodes/hive-snet');
exec('docker push newtoncodes/hive-snet:' + version);

exec('docker push newtoncodes/hive-unsee');
exec('docker push newtoncodes/hive-unsee:' + version);

console.log('Done.');
process.exit(0);