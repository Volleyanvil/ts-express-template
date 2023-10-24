import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';
const { combine, timestamp, label, printf } = format;
import { ENV, LOGS_PATH } from '@config/environment.config';

// Winston docs: https://github.com/winstonjs/winston#usage

const customFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp as string} [${label}] ${level.toUpperCase()}: ${message}`;
});

// TODO: Update to adopt singleton pattern for logger https://en.wikipedia.org/wiki/Singleton_pattern
const LoggerWrapper = (): WinstonLogger => {
  const logger: WinstonLogger = createLogger({
    level: 'info',
    format: combine(
      timestamp({ format: 'isoDateTime' }),
      customFormat
    ),
    // defaultMeta: {},
    exitOnError: false,
    // silent: false,
    transports: [
      new transports.File({ 
        filename: `${LOGS_PATH}/error.log`,
        level: 'error'
      }),
      new transports.File({ filename: `${LOGS_PATH}/combined.log` }),
    ]
  });

  // Add debug-level console logging when not in production
  //
  if (ENV !== 'production') {
    logger.add(new transports.Console({
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss'}),
        label({ label: 'DEV' }),
        customFormat
      ),
      level: 'debug',
    }));
  }
  return logger;
}

export const logger = LoggerWrapper();
