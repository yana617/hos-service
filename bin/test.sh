docker-compose up -d mongo-db

export MONGO_DB=test-db
export MONGO_PORT=27018
export MONGO_HOSTNAME=localhost

echo "start running tests"
jest --coverage --runInBand
echo "tearing down all containers"

docker-compose stop
