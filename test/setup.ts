process.env = {
    ...process.env,
    HOST: '0.0.0.0',
    PORT: '8000',
    MONGODB_URI: 'mongodb://localhost/test',
    MONGODB_USER: 'root',
    MONGODB_PWD: 'example',
    ACCESS_TOKEN_SECRET: 'testing-access-token-secret-passphrase',
    ACCESS_TOKEN_EXPIRATION: '9999',
    ACCESS_TOKEN_ALG: 'HS256',
    REFRESH_TOKEN_SECRET: 'testing-refresh-token-secret-passphrase',
    REFRESH_TOKEN_EXPIRATION: '99',
    REFRESH_TOKEN_FAMILY_EXPIRATION: '999',
  };