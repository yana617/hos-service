docker-compose up -d mongo-db

echo "start running tests"
jest --coverage --runInBand
echo "tearing down all containers"

docker-compose stop
