import { config as Dotenv } from 'dotenv';

enum ENVIRONS {
  development = 'development',
  production = 'production',
  test = 'test'
}

interface IEnvironment {
  ENV: string,
  ACCESS_TOKEN_SECRET: string,
  ACCESS_TOKEN_EXPIRATION: number,
  ACCESS_TOKEN_ALG: string,
  REFRESH_TOKEN_SECRET: string,
  REFRESH_TOKEN_EXPIRATION: number,
  REFRESH_TOKEN_FAMILY_EXPIRATION: number,
  PORT: number,
  HOST: string,
  LOGS_PATH: string,
  MONGODB_URI: string,
  MONGODB_USER: string,
  MONGODB_PWD: string,
}

// TODO: Validate environmental variables
// TODO: AUTH variables
export const EnvironmentWrapper = (): IEnvironment => {
  let ENV: string = ENVIRONS.development;
  if ( process.env.NODE_ENV ) {
    ENV = ENVIRONS[process.env.NODE_ENV as ENVIRONS];
  }

  if ( ENV != ENVIRONS.test ) Dotenv(); // Skip in testing

  if ( !process.env.ACCESS_TOKEN_SECRET ) {
    console.log('ACCESS_TOKEN_SECRET not found.');
    process.exit(1);
  }
  const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

  if ( process.env.ACCESS_TOKEN_EXPIRATION && isNaN(parseInt(process.env.ACCESS_TOKEN_EXPIRATION))) {
    console.log('ACCESS_TOKEN_EXPIRATION should be a number.');
    process.exit(1);
  }
  const ACCESS_TOKEN_EXPIRATION = parseInt(process.env.ACCESS_TOKEN_EXPIRATION) || 15;

  const ACCESS_TOKEN_ALG = process.env.ACCESS_TOKEN_ALG || 'HS256';

  if ( !process.env.REFRESH_TOKEN_SECRET ) {
    console.log('REFRESH_TOKEN_SECRET not found.');
    process.exit(1);
  }
  const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

  if ( process.env.REFRESH_TOKEN_EXPIRATION && isNaN(parseInt(process.env.REFRESH_TOKEN_EXPIRATION))) {
    console.log('REFRESH_TOKEN_EXPIRATION should be a number.');
    process.exit(1);
  }
  const REFRESH_TOKEN_EXPIRATION = parseInt(process.env.REFRESH_TOKEN_EXPIRATION) || 7;

  if ( process.env.REFRESH_TOKEN_FAMILY_EXPIRATION && isNaN(parseInt(process.env.REFRESH_TOKEN_FAMILY_EXPIRATION))) {
    console.log('REFRESH_TOKEN_FAMILY_EXPIRATION should be a number.');
    process.exit(1);
  }
  const REFRESH_TOKEN_FAMILY_EXPIRATION = parseInt(process.env.REFRESH_TOKEN_FAMILY_EXPIRATION) || 30;

  if ( process.env.PORT && (isNaN(parseInt(process.env.PORT)) || parseInt(process.env.PORT) > 65535)) {
    console.log('PORT value is invalid. Use a valid TCP port number.');
    process.exit(1);
  } 
  const PORT = parseInt(process.env.PORT) || 8000;

  const host_rx = /^((25[0-5]|2[0-4]\d|[01]?\d?\d)(\.|$)){4}$/;
  if ( process.env.HOST && !( host_rx.test(process.env.HOST) || process.env.HOST === 'localhost' ) ) {
      console.log('HOST value is invalid. Use a valid IPv4 address.');
      process.exit(1);
  }
  const HOST: string = process.env.HOST || '0.0.0.0';

  const LOGS_PATH: string = process.env.LOGS_PATH || 'logs';

  const mongo_rx = /^mongodb:\/\/.*\/.*$/;
  if ( process.env.MONGODV_URI && !( mongo_rx.test(process.env.MONGODB_URI) ) ) {
      console.log('MONGODB_URI value is invalid.');
      process.exit(1);
  }
  const MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/explate'
  const MONGODB_USER: string = process.env.MONGODB_USER;
  const MONGODB_PWD: string = process.env.MONGODB_PWD;

  return {
    ENV: ENV,
    ACCESS_TOKEN_SECRET: ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRATION: ACCESS_TOKEN_EXPIRATION,
    ACCESS_TOKEN_ALG: ACCESS_TOKEN_ALG,
    REFRESH_TOKEN_SECRET: REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRATION: REFRESH_TOKEN_EXPIRATION,
    REFRESH_TOKEN_FAMILY_EXPIRATION: REFRESH_TOKEN_FAMILY_EXPIRATION,
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
const ACCESS_TOKEN_SECRET = env.ACCESS_TOKEN_SECRET as string;
const ACCESS_TOKEN_EXPIRATION = env.ACCESS_TOKEN_EXPIRATION as number;
const ACCESS_TOKEN_ALG = env.ACCESS_TOKEN_ALG as string;
const REFRESH_TOKEN_SECRET = env.REFRESH_TOKEN_SECRET as string;
const REFRESH_TOKEN_EXPIRATION = env.REFRESH_TOKEN_EXPIRATION as number;
const REFRESH_TOKEN_FAMILY_EXPIRATION = env.REFRESH_TOKEN_FAMILY_EXPIRATION as number;

export { ENV, PORT, HOST, LOGS_PATH, MONGODB_URI, MONGODB_USER, MONGODB_PWD, ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRATION, ACCESS_TOKEN_ALG, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRATION, REFRESH_TOKEN_FAMILY_EXPIRATION };