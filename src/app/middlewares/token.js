import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

/**
 * Middleware to parse the user's token.
 *
 * @param {Request} req the request object
 * @param {Response} res the response object
 * @param {Function} next function to call next middleware
 * @returns a promise that resolves to void after parsing the token
 */
export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const [, token] = authHeader.split(' ');

    try {
      const decoded = await promisify(jwt.verify)(token, authConfig.secret);

      req.userId = decoded.id;
    } catch (err) {} // eslint-disable-line no-empty
  }

  return next();
};
