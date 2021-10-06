docker-compose up -d mongo-db

export MONGO_DB=test-db
export MONGO_PORT=27017

echo "start running tests"
jest --coverage
echo "tearing down all containers"

docker-compose stop
