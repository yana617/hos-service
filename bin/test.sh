docker-compose up -d mongo-db

echo "start running tests"
jest --coverage
echo "tearing down all containers"

docker-compose stop