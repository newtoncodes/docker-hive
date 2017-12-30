#!/usr/bin/env bash

if [ -z "$INSTALL_PATH" ]; then
    echo "Install path:"
    read INSTALL_PATH
fi
DIRNAME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "SSH allow to IP:"
read IP_SSH_REMOTE

echo "VPN internal IP:"
read IP_VPN


# Remove online.net mirrors
sed -i 's/http:\/\/mirrors.online.net\/ubuntu/http:\/\/archive.ubuntu.com\/ubuntu/' /etc/apt/sources.list

apt-get update
DEBIAN_FRONTEND="noninteractive" apt-get upgrade -y

DEBIAN_FRONTEND="noninteractive" apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common

DEBIAN_FRONTEND="noninteractive" apt-get install -y iptables-persistent
DEBIAN_FRONTEND="noninteractive" apt-get install -y openvpn socat

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

apt-key fingerprint 0EBFCD88

add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"

apt-get update
DEBIAN_FRONTEND="noninteractive" apt-get install -y docker-ce
apt-cache madison docker-ce

###

mkdir -p "$INSTALL_PATH"
rm -rf ${INSTALL_PATH}/*

mkdir -p "$INSTALL_PATH/bin"
mkdir -p "$INSTALL_PATH/config"

cp -r ${DIRNAME}/../install/bin/*.sh "$INSTALL_PATH/bin/"
cp -r "$DIRNAME/../install/config/iptables" "$INSTALL_PATH/config/"
mkdir -p "$INSTALL_PATH/config/openvpn/available"
mkdir -p "$INSTALL_PATH/config/openvpn/enabled"
mkdir -p "$INSTALL_PATH/config/iptables/available"
mkdir -p "$INSTALL_PATH/config/iptables/enabled"


chmod +x ${INSTALL_PATH}/bin/*.sh

ln -s ${INSTALL_PATH}/config/iptables/available/*.sh "$INSTALL_PATH/config/iptables/enabled/"

sed -i "s/{{IP_SSH_REMOTE}}/$IP_SSH_REMOTE/" "$INSTALL_PATH/config/iptables/available/ssh.sh"
sed -i "s/{{IP_VPN}}/$IP_VPN/" "$INSTALL_PATH/config/iptables/available/vpn.sh"

#bash "$INSTALL_PATH/bin/iptables.sh"
#bash "$INSTALL_PATH/bin/openvpn.sh"
