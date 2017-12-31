#!/bin/bash

# HTPASSWD=`htpasswd -nbB ${ADMIN_USERNAME} ${ADMIN_PASSWORD} | cut -d ":" -f 2`
# /portainer -H "unix:///var/run/docker.sock" --admin-password="'$HTPASSWD'"

# Set the user and password via the API, because the CLI doesn't allow choosing an admin username. This way it works like auth.

portainer_api() {
  local verb=$1
  local url=$2
  local params=$3
  local body=$4
  local response
  local cmd

  cmd="curl -L -s --fail -H \"Accept: application/json\" -H \"Content-Type: application/json\" -X ${verb} -k http://127.0.0.1:9000${url}"
  [[ -n "${params}" ]] && cmd="${cmd} -d \"${params}\""
  [[ -n "${body}" ]] && cmd="${cmd} --data '${body}'"
  echo "Running ${cmd}"
  eval ${cmd} || return 1
  return 0
}

wait_for_api() {
  while ! portainer_api GET /
  do
    sleep 5
  done
}

install_user() {
  echo "Installing admin user..."
  if portainer_api POST /api/users/admin/init "" "{\"Username\":\"${ADMIN_USERNAME}\",\"Password\":\"${ADMIN_PASSWORD}\"}"; then
    echo "installed ok"
  else
    echo "install failed"
  fi
}

configure_portainer() {
  wait_for_api
  install_user
}

echo "Running configure_portainer in the background..."
configure_portainer &
/portainer -H "unix:///var/run/docker.sock" --no-analytics
exit 0