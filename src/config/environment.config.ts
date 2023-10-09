import 'dotenv/config';

enum ENVIRONS {
  development = 'development',
  production = 'production',
  testing = 'testing'
}

// TODO: Validate environmental variables

let ENV: string = ENVIRONS.development;
if (process.env.NODE_DEV) {
  ENV = ENVIRONS[process.env.NODE_DEV as ENVIRONS];
}

if ( process.env.PORT && (isNaN(parseInt(process.env.PORT)) || parseInt(process.env.PORT) > 65535)) {
  console.log('PORT value is invalid. Use a valid TCP port number.');
  process.exit(0);
} 
const PORT: number = parseInt(process.env.PORT) || 8000;

const host_rx = /^((25[0-5]|2[0-4]\d|[01]?\d?\d)(\.|$)){4}$/;
if ( process.env.PORT && !host_rx.test(process.env.HOST)) {
    console.log('HOST value is invalid. Use a valid IPv4 address.');
    process.exit(0);
  } 
const HOST: string = process.env.HOST || '0.0.0.0';

const LOGS_PATH: string = process.env.LOGS_PATH || 'logs';

export { ENV, PORT, HOST, LOGS_PATH };