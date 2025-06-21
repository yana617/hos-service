const express = require('express');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const yaml = require('js-yaml');
const cors = require('cors');

const setToken = require('./src/middlewares/setToken');

const swaggerDocument = yaml.load(fs.readFileSync('./swagger.yaml'));

const app = express();

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((req, res, next) => {
  req.headers.origin = req.headers.origin || req.headers.host;
  next();
});

const {
  PORT,
  UI_LOCAL_URL,
  UI_PROD_URL,
  UI_NEW_PROD_URL, // temporary
  DOCKER_HOS_SERVICE_URL,
  AUTH_SERVICE_PROD_URL,
} = process.env;

const whitelist = [UI_NEW_PROD_URL, UI_PROD_URL, DOCKER_HOS_SERVICE_URL, AUTH_SERVICE_PROD_URL];
if (process.env.NODE_ENV !== 'production') {
  const POSTMAN_URL = `localhost:${PORT}`;
  whitelist.push(POSTMAN_URL);
  whitelist.push(UI_LOCAL_URL);
}

const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200,
};

if (process.env.NODE_ENV !== 'test') {
  app.use(cors(corsOptions));
  app.use(morgan(':method [:status] :url  :response-time ms'));
}

app.use('/static', express.static('img'));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

app.use(setToken);
app.use(require('./src/routes'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message });
});

module.exports = app;
