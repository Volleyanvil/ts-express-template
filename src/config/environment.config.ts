import { config as Dotenv } from 'dotenv';

enum ENVIRONS {
  development = 'development',
  production = 'production',
  test = 'test'
}

interface EnvInterface {
  ENV: string,
  PORT: number,
  HOST: string,
  LOGS_PATH: string,
}

// TODO: Validate environmental variables
export const EnvironmentWrapper = (): EnvInterface => {
  let ENV: string = ENVIRONS.development;
  if ( process.env.NODE_ENV ) {
    ENV = ENVIRONS[process.env.NODE_ENV as ENVIRONS];
  }

  if ( ENV != ENVIRONS.test ) Dotenv(); // Skip in testing

  if ( process.env.PORT && (isNaN(parseInt(process.env.PORT)) || parseInt(process.env.PORT) > 65535)) {
    console.log('PORT value is invalid. Use a valid TCP port number.');
    process.exit(0);
  } 
  const PORT: number = parseInt(process.env.PORT) || 8000;

  const host_rx = /^((25[0-5]|2[0-4]\d|[01]?\d?\d)(\.|$)){4}$/;
  if ( process.env.HOST && !( host_rx.test(process.env.HOST) || process.env.HOST === 'localhost' ) ) {
      console.log('HOST value is invalid. Use a valid IPv4 address.');
      process.exit(0);
  }
  const HOST: string = process.env.HOST || '0.0.0.0';

  const LOGS_PATH: string = process.env.LOGS_PATH || 'logs';
  return {
    ENV: ENV,
    PORT: PORT,
    HOST: HOST,
    LOGS_PATH: LOGS_PATH,
  }
};

const env = EnvironmentWrapper();

const ENV = env.ENV as string;
const HOST = env.HOST as string;
const PORT = env.PORT as number;
const LOGS_PATH = env.LOGS_PATH as string;

export { ENV, PORT, HOST, LOGS_PATH };