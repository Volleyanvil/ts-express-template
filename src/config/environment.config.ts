import 'dotenv/config';

enum ENVIRONS {
    development = 'development',
    production = 'production',
    testing = 'testing'
}

let ENV: string = ENVIRONS.development;
if (process.env.NODE_DEV) {
    ENV = ENVIRONS[process.env.NODE_DEV as ENVIRONS];
}

const PORT: number = ENV !== ENVIRONS.production ? 8000 : parseInt(process.env.PORT);

const HOST: string = ENV !== ENVIRONS.production ? '0.0.0.0' : process.env.HOST;

const LOGS_PATH: string = process.env.LOGS_PATH || 'logs';

export { ENV, PORT, HOST, LOGS_PATH };