import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';
const { combine, timestamp, label, printf } = format;
import { ENV, LOGS_PATH } from '@config/environment.config';

// Winston docs: https://github.com/winstonjs/winston#usage
// Singleton pattern https://en.wikipedia.org/wiki/Singleton_pattern

class LoggerConf {

  private static instance: LoggerConf;

  private logger: WinstonLogger;

  private customFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp as string} [${label}] ${level.toUpperCase()}: ${message}`;
  });

  static get(): LoggerConf {
    if (!LoggerConf.instance) {
      LoggerConf.instance = new LoggerConf();
    }
    return LoggerConf.instance;
  }

  init(): WinstonLogger {
    if (this.logger) return this.logger;

    // Initialize Winston logger
    this.logger = createLogger({
      level: 'info',
      format: combine(
        timestamp({ format: 'isoDateTime' }),
        this.customFormat
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
    if (ENV !== 'production') {
      this.logger.add(new transports.Console({
        format: combine(
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss'}),
          label({ label: 'DEV' }),
          this.customFormat
        ),
        level: 'debug',
      }));
    }

    return this.logger;
  }

}

export const Logger = LoggerConf.get().init();

