'use strict';

const {exec, getVars} = require('../lib');

getVars();

module.exports = {
    start: async () => {
        exec('docker stack deploy --compose-file /etc/docker-hive/stack.yml --with-registry-auth hive');
        
        /*
        docker stop $(docker ps -a -q --filter="name=hive_snet")
docker rm $(docker ps -a -q --filter="name=hive_snet")
         */
        exec('docker run --name hive_snet --detach --hostname snet --restart always --cap-add=NET_ADMIN --device=/dev/net/tun --network=hive -v ${SWARM_PATH}/config/openvpn/enabled_hive:/etc/snet {{SWARM_PORTS}} newtoncodes/hive-snet:1.0.0')
    }
};