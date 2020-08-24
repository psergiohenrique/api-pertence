/**
 * Error class for server errors.
 */
export default class ServerError extends Error {
  /**
   * Constructor.
   *
   * @param {string} [message] the error message
   * @param {number} [statusCode=500] the status code to be returned by the server
   * @param {string} [logLevel='error'] the log level used for this error
   */
  constructor(message, statusCode = 500, logLevel = 'error') {
    super(message);

    this.statusCode = statusCode;
    this.logLevel = logLevel;
  }
}
