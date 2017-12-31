#!/bin/bash

# Script to configure grafana datasources and dashboards.
# https://github.com/grafana/grafana-docker/issues/74

export GF_SECURITY_ADMIN_USER="$ADMIN_USERNAME"
export GF_SECURITY_ADMIN_PASSWORD="$ADMIN_PASSWORD"

GRAFANA_URL=http://${GF_SECURITY_ADMIN_USER}:${GF_SECURITY_ADMIN_PASSWORD}@localhost:3000
DATASOURCES_PATH=${DATASOURCES_PATH:-/etc/grafana/datasources}
DASHBOARDS_PATH=${DASHBOARDS_PATH:-/etc/grafana/dashboards}
DASHBOARDS_SYSTEM_PATH=${DASHBOARDS_SYSTEM_PATH:-/etc/grafana/dashboards_system}

# Generic function to call the Vault API
grafana_api() {
  local verb=$1
  local url=$2
  local params=$3
  local body=$4
  local response
  local cmd

  cmd="curl -L -s --fail -H \"Accept: application/json\" -H \"Content-Type: application/json\" -X ${verb} -k ${GRAFANA_URL}${url}"
  [[ -n "${params}" ]] && cmd="${cmd} -d \"${params}\""
  [[ -n "${body}" ]] && cmd="${cmd} --data @${body}"
  echo "Running ${cmd}"
  eval ${cmd} || return 1
  return 0
}

wait_for_api() {
  while ! grafana_api GET /api/user/preferences
  do
    sleep 5
  done
}

install_datasources() {
  local datasource

  for datasource in ${DATASOURCES_PATH}/*.json
  do
    if [[ -f "${datasource}" ]]; then
      echo "Installing datasource ${datasource}"
      if grafana_api POST /api/datasources "" "${datasource}"; then
        echo "installed ok"
      else
        echo "install failed"
      fi
    fi
  done
}

install_dashboards() {
  local dashboard

  for dashboard in ${DASHBOARDS_SYSTEM_PATH}/*.json
  do
    if [[ -f "${dashboard}" ]]; then
      echo "Installing system dashboard ${dashboard}"
      if grafana_api POST /api/dashboards/db "" "${dashboard}"; then
        echo "installed ok"
      else
        echo "install failed"
      fi
    fi
  done

  for dashboard in ${DASHBOARDS_PATH}/*.json
  do
    if [[ -f "${dashboard}" ]]; then
      echo "Installing dashboard ${dashboard}"
      if grafana_api POST /api/dashboards/db "" "${dashboard}"; then
        echo "installed ok"
      else
        echo "install failed"
      fi
    fi
  done
}

configure_grafana() {
  wait_for_api
  install_datasources
  install_dashboards
}

echo "Running configure_grafana in the background..."
configure_grafana &
/run.sh
exit 0
