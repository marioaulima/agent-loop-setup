#!/usr/bin/env bash
set -euo pipefail

if ! command -v podman >/dev/null 2>&1; then
	echo "podman is required to run integration tests with Podman." >&2
	exit 1
fi

socket_path=""

if [[ "$(uname -s)" == "Darwin" ]]; then
	socket_path="$(podman machine inspect --format '{{.ConnectionInfo.PodmanSocket.Path}}')"
	export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE="/var/run/docker.sock"
else
	socket_path="$(podman info --format '{{.Host.RemoteSocket.Path}}')"
fi

if [[ -z "$socket_path" ]]; then
	echo "Could not resolve the Podman socket path." >&2
	exit 1
fi

export DOCKER_HOST="unix://${socket_path}"
export TESTCONTAINERS_RYUK_DISABLED="true"

exec pnpm turbo run test:integration
