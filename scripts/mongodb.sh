#!/bin/bash

# fail on error
set -e

# =============================================================================================
if [[ "$(basename $PWD)" == "scripts" ]]; then
	cd ..
fi
echo $PWD

# =============================================================================================
unset BACKMAN_CONFIG
unset VCAP_SERVICES
source _fixtures/env_for_mongodb # use BACKMAN_CONFIG and VCAP_SERVICES, layered with _fixtures/config_with_bindings.json
# this will test reading the mongodb service binding from VCAP_SERVICES, and the S3 credentials from config.json
# also it will read the mongodb service binding with label set to "user-provided", and correctly guess it to be of type mongodb thanks to URI parsing

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
echo "waiting on mongodb ..."
retry 10 mongo --host 127.0.0.1 -u 'mongoadmin' -p 'super-secret' --authenticationDatabase admin --quiet --eval 'db.runCommand("ping").ok'
echo "mongodb is up!"

# =============================================================================================
echo "testing mongodb integration ..."

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

if [ $(curl -s -o /dev/null -w "%{http_code}" http://john:doe@127.0.0.1:9990/api/v1/state/mongodb/my_mongodb) != "200" ]; then
	echo "Failed to query state"
	exit 1
fi
curl -s http://john:doe@127.0.0.1:9990/api/v1/state/mongodb/my_mongodb | grep '"Status":"idle"'

# write to mongodb
mongo --host 127.0.0.1 -u 'mongoadmin' -p 'super-secret' --authenticationDatabase admin <<EOF
db.inventory.insertMany([
   { item: "my_backup_item_a", status: "test" },
   { item: "my_backup_item_b", status: "test" }
]);
EOF
sleep 2

# trigger new backup
curl -X POST http://john:doe@127.0.0.1:9990/api/v1/backup/mongodb/my_mongodb
curl -s http://john:doe@127.0.0.1:9990/api/v1/state/mongodb/my_mongodb | grep '"Operation":"backup"' | grep '"Status":"running"'
sleep 15
curl -s http://john:doe@127.0.0.1:9990/api/v1/state/mongodb/my_mongodb | grep '"Operation":"backup"' | grep '"Status":"success"'

# read from mongodb
mongo --host 127.0.0.1 -u 'mongoadmin' -p 'super-secret' --authenticationDatabase admin --eval 'db.inventory.find( { status: "test" } );' | grep 'my_backup_item_a'
mongo --host 127.0.0.1 -u 'mongoadmin' -p 'super-secret' --authenticationDatabase admin --eval 'db.inventory.find( { status: "test" } );' | grep 'my_backup_item_b'

# delete from mongodb
mongo --host 127.0.0.1 -u 'mongoadmin' -p 'super-secret' --authenticationDatabase admin --eval 'db.inventory.deleteMany( { item: "my_backup_item_a" } );'
mongo --host 127.0.0.1 -u 'mongoadmin' -p 'super-secret' --authenticationDatabase admin --eval 'db.inventory.insert({ item: "my_backup_item_c", status: "test" });'
sleep 2
mongo --host 127.0.0.1 -u 'mongoadmin' -p 'super-secret' --authenticationDatabase admin --eval 'db.inventory.find( { status: "test" } );' | grep 'my_backup_item_c'
mongo --host 127.0.0.1 -u 'mongoadmin' -p 'super-secret' --authenticationDatabase admin --eval 'db.inventory.find( { status: "test" } );' | grep -v 'my_backup_item_a'

# trigger restore
FILENAME=$(curl -s http://john:doe@127.0.0.1:9990/api/v1/backup/mongodb/my_mongodb | jq -r .Files[0].Filename)
curl -X POST http://john:doe@127.0.0.1:9990/api/v1/restore/mongodb/my_mongodb/${FILENAME}
curl -s http://john:doe@127.0.0.1:9990/api/v1/state/mongodb/my_mongodb | grep '"Operation":"restore"' | grep '"Status":"running"'
sleep 15
curl -s http://john:doe@127.0.0.1:9990/api/v1/state/mongodb/my_mongodb | grep '"Operation":"restore"' | grep '"Status":"success"'

# read from mongodb
mongo --host 127.0.0.1 -u 'mongoadmin' -p 'super-secret' --authenticationDatabase admin --eval 'db.inventory.find( { status: "test" } );' | grep -v 'my_backup_item_c'
mongo --host 127.0.0.1 -u 'mongoadmin' -p 'super-secret' --authenticationDatabase admin --eval 'db.inventory.find( { status: "test" } );' | grep 'my_backup_item_a'
mongo --host 127.0.0.1 -u 'mongoadmin' -p 'super-secret' --authenticationDatabase admin --eval 'db.inventory.find( { status: "test" } );' | grep 'my_backup_item_b'

# delete backup
curl -X DELETE http://john:doe@127.0.0.1:9990/api/v1/backup/mongodb/my_mongodb/${FILENAME}
sleep 10
curl -s http://john:doe@127.0.0.1:9990/api/v1/backup/mongodb/my_mongodb | grep -v 'Filename'
