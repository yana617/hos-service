# House-of-souls API service

### To run
```
docker compose up --build
```

### To run tests
```
npm run test:docker
```

### Updating swagger
Add new swagger path or schema files in **documentation/** folder

Then run
```
npm install -g swagger-cli
swagger-cli bundle documentation/swagger.yaml --outfile swagger.yaml --type yaml
```