const express = require('express');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const yaml = require('js-yaml');
const cors = require('cors');

const swaggerDocument = yaml.load(fs.readFileSync('./swagger.yaml'));

const app = express();

const whitelist = ['http://localhost:8080'];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200,
};

if (process.env.NODE_ENV !== 'test') {
  app.use(cors(corsOptions));
}

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(':method [:status] :url  :response-time ms'));
}

app.use('/static', express.static('img'));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

app.use(require('./src/routes'));

module.exports = app;
