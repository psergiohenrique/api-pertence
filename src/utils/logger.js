import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf } = format;

export default createLogger({
  level: process.env.LOG_LEVEL,
  exitOnError: false,
  format: combine(
    timestamp(),
    printf(info => {
      if (info instanceof Error) {
        return `${info.timestamp} [${info.level}]: ${info.message}\n${info.stack}`;
      }

      return `${info.timestamp} [${info.level}]: ${info.message}`;
    })
  ),
  transports: [new transports.Console({})],
});
