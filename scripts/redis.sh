#!/bin/bash

# fail on error
set -e

# =============================================================================================
if [[ "$(basename $PWD)" == "scripts" ]]; then
	cd ..
fi
echo $PWD

# =============================================================================================
# do not source any env vars at all for this test, we rely entirely on _fixtures/config_with_bindings.json
unset BACKMAN_CONFIG
unset VCAP_SERVICES
unset SERVICE_BINDING_ROOT
export PORT="9990"
# this will test reading the redis service binding entirely from config.json, as well as the S3 credentials

# =============================================================================================
retry() {
    local -r -i max_attempts="$1"; shift
    local -r cmd="$@"
    local -i attempt_num=1

    until $cmd
    do
        if (( attempt_num == max_attempts ))
        then
            echo "Attempt $attempt_num failed and there are no more attempts left!"
            return 1
        else
            echo "Attempt $attempt_num failed! Trying again in $attempt_num seconds..."
            sleep $(( attempt_num++ ))
        fi
    done
}

# =============================================================================================
echo "waiting on redis ..."
retry 10 redis-cli -h 127.0.0.1 ping
echo "redis is up!"

echo "configuring redis auth password ..."
redis-cli -h 127.0.0.1 CONFIG SET requirepass "very-secret" || true

# =============================================================================================
echo "testing redis integration ..."

sleep 5
# starting backman
killall backman || true
./backman -config _fixtures/config_with_bindings.json 2>&1 &
sleep 10

set -x
if [ $(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:9990) != "401" ]; then
	echo "Should be Unauthorized"
	exit 1
fi

if [ $(curl -s -o /dev/null -w "%{http_code}" http://john:doe@127.0.0.1:9990) != "200" ]; then
	echo "Should be authorized"
	exit 1
fi

if [ $(curl -s -o /dev/null -w "%{http_code}" http://john:doe@127.0.0.1:9990/healthz) != "200" ]; then
    echo "Should be OK"
    exit 1
fi

if [ $(curl -s -o /dev/null -w "%{http_code}" http://john:doe@127.0.0.1:9990/api/v1/state/redis-2/my-redis) != "200" ]; then
	echo "Failed to query state"
	exit 1
fi
curl -s http://john:doe@127.0.0.1:9990/api/v1/state/redis-2/my-redis | grep '"Status":"idle"'

# write to redis
redis-cli -h 127.0.0.1 -a 'very-secret' SET blubb 123
redis-cli -h 127.0.0.1 -a 'very-secret' SET blabb hello
sleep 2

# trigger new backup
curl -X POST http://john:doe@127.0.0.1:9990/api/v1/backup/redis-2/my-redis
curl -s http://john:doe@127.0.0.1:9990/api/v1/state/redis-2/my-redis | grep '"Operation":"backup"' | grep '"Status":"running"'
sleep 15
curl -s http://john:doe@127.0.0.1:9990/api/v1/state/redis-2/my-redis | grep '"Operation":"backup"' | grep '"Status":"success"'

# read from redis
redis-cli -h 127.0.0.1 -a 'very-secret' GET blubb | grep 123
redis-cli -h 127.0.0.1 -a 'very-secret' GET blabb | grep hello

# download backup and check for completeness
FILENAME=$(curl -s http://john:doe@127.0.0.1:9990/api/v1/backup/redis-2/my-redis | jq -r .Files[0].Filename)
curl -s http://john:doe@127.0.0.1:9990/api/v1/backup/redis-2/my-redis/${FILENAME}/download | zgrep 'blubb'

# delete from redis
redis-cli -h 127.0.0.1 -a 'very-secret' DEL blubb
redis-cli -h 127.0.0.1 -a 'very-secret' SET blibb howdy
sleep 2
redis-cli -h 127.0.0.1 -a 'very-secret' GET blubb | grep -v 123
redis-cli -h 127.0.0.1 -a 'very-secret' GET blibb | grep howdy

## restore is unsupported for redis
# # trigger restore
# FILENAME=$(curl -s http://john:doe@127.0.0.1:9990/api/v1/backup/redis-2/my-redis | jq -r .Files[0].Filename)
# curl -X POST http://john:doe@127.0.0.1:9990/api/v1/restore/redis-2/my-redis/${FILENAME}
# curl -s http://john:doe@127.0.0.1:9990/api/v1/state/redis-2/my-redis | grep '"Operation":"restore"' | grep '"Status":"running"'
# sleep 15
# curl -s http://john:doe@127.0.0.1:9990/api/v1/state/redis-2/my-redis | grep '"Operation":"restore"' | grep '"Status":"success"'

# # read from redis
# redis-cli -h 127.0.0.1 -a 'very-secret' GET blibb | grep -v howdy
# redis-cli -h 127.0.0.1 -a 'very-secret' GET blubb | grep 123
# redis-cli -h 127.0.0.1 -a 'very-secret' GET blabb | grep hello

# delete backup
curl -X DELETE http://john:doe@127.0.0.1:9990/api/v1/backup/redis-2/my-redis/${FILENAME}
sleep 10
curl -s http://john:doe@127.0.0.1:9990/api/v1/backup/redis-2/my-redis | grep -v 'Filename'
