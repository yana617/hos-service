docker-compose up -d mongo-db

export MONGO_PORT=27018
export MONGO_HOSTNAME=localhost

export MONGO_INITDB_ROOT_USERNAME=root
export MONGO_INITDB_ROOT_PASSWORD=rootPassword
export MONGO_INITDB_DATABASE=test-db
export MONGODB_USERNAME=root
export MONGODB_PASSWORD=rootPassword
export MONGODB_DATABASE=test-db

echo "start running tests"
jest --coverage --runInBand
echo "tearing down all containers"

docker-compose stop
