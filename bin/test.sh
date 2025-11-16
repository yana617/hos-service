docker compose up -d mongo-db

export MONGO_PORT=27018
export MONGO_HOSTNAME=localhost
export MONGODB_DATABASE=test-db

echo "start running tests"
npx browserslist@latest --update-db
jest --coverage --runInBand
echo "tearing down all containers"

docker compose stop
