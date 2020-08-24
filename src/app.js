import 'dotenv/config';
import { ValidationError } from 'yup';

import express from 'express';
import cors from 'cors';

import routes from './routes';
import logger from './utils/logger';
import './database';

// Must use require syntax since this module exports a different default object
const morgan = require('morgan');

/**
 * Global error handler.
 *
 * @param {Error} err the error object
 * @param {Request} req the request object
 * @param {Response} res the response object
 * @param {Function} next express next handler
 */
function errorHandler(err, req, res, next) {
  // Yup validation errors
  if (err instanceof ValidationError) {
    err.statusCode = 400;
    err.logLevel = 'warn';
    err.message = 'Erro de validação';

    // Log the validation errors
    logger.warn(err.errors);
  }

  const response = {
    error: err.statusCode ? err.message : 'Erro inesperado',
    statusCode: err.statusCode || 500,
  };

  // Additional error details returned for non production environments
  if (process.env.NODE_ENV !== 'production') {
    response.validationErrors = err.errors;
  }

  logger[err.logLevel || 'error'](err);

  res.status(err.statusCode || 500).json(response);
}

class App {
  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(
      morgan('short', {
        stream: {
          write: message => logger.info(message),
        },
      })
    );
    this.server.use(express.json());
    this.server.use(cors());
  }

  routes() {
    this.server.use(routes);
    this.server.use(errorHandler);
  }
}

export default new App().server;
