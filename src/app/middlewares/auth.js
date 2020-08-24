import ServerError from '../../utils/ServerError';

/**
 * Middleware to require authentication.
 *
 * @param {Request} req the request object
 * @param {Response} res the response object
 * @param {Function} next function to call next middleware
 * @returns void
 */
export default (req, res, next) => {
  if (!req.userId) {
    throw new ServerError('Unauthorized', 401, 'warn');
  }

  return next();
};
