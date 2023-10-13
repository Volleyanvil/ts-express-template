import { config as Dotenv } from 'dotenv';

enum ENVIRONS {
  development = 'development',
  production = 'production',
  test = 'test'
}

interface IEnvironment {
  ENV: string,
  PORT: number,
  HOST: string,
  LOGS_PATH: string,
  MONGODB_URI: string,
  MONGODB_USER: string,
  MONGODB_PWD: string,
}

// TODO: Validate environmental variables
export const EnvironmentWrapper = (): IEnvironment => {
  let ENV: string = ENVIRONS.development;
  if ( process.env.NODE_ENV ) {
    ENV = ENVIRONS[process.env.NODE_ENV as ENVIRONS];
  }

  if ( ENV != ENVIRONS.test ) Dotenv(); // Skip in testing

  if ( process.env.PORT && (isNaN(parseInt(process.env.PORT)) || parseInt(process.env.PORT) > 65535)) {
    console.log('PORT value is invalid. Use a valid TCP port number.');
    process.exit(1);
  } 
  const PORT: number = parseInt(process.env.PORT) || 8000;

  const host_rx = /^((25[0-5]|2[0-4]\d|[01]?\d?\d)(\.|$)){4}$/;
  if ( process.env.HOST && !( host_rx.test(process.env.HOST) || process.env.HOST === 'localhost' ) ) {
      console.log('HOST value is invalid. Use a valid IPv4 address.');
      process.exit(1);
  }
  const HOST: string = process.env.HOST || '0.0.0.0';

  const LOGS_PATH: string = process.env.LOGS_PATH || 'logs';

  const MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/explate'
  const mongo_rx = /^mongodb:\/\/.*\/.*$/;
  if ( MONGODB_URI && !( mongo_rx.test(MONGODB_URI) ) ) {
      console.log('MONGODB_URI value is invalid.');
      process.exit(1);
  }
  const MONGODB_USER: string = process.env.MONGODB_USER;
  const MONGODB_PWD: string = process.env.MONGODB_PWD;

  return {
    ENV: ENV,
    PORT: PORT,
    HOST: HOST,
    LOGS_PATH: LOGS_PATH,
    MONGODB_URI: MONGODB_URI,
    MONGODB_USER: MONGODB_USER,
    MONGODB_PWD: MONGODB_PWD,
  }
};

const env = EnvironmentWrapper();

const ENV = env.ENV as string;
const HOST = env.HOST as string;
const PORT = env.PORT as number;
const LOGS_PATH = env.LOGS_PATH as string;
const MONGODB_URI = env.MONGODB_URI as string;
const MONGODB_USER = env.MONGODB_USER as string;
const MONGODB_PWD = env.MONGODB_PWD as string;

export { ENV, PORT, HOST, LOGS_PATH, MONGODB_URI, MONGODB_USER, MONGODB_PWD };