import { EnvironmentWrapper } from "@config/environment.config";

describe('Environment', () => {
  const ENV: NodeJS.ProcessEnv = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ENV };
    process.env.NODE_ENV = 'test';
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  afterAll(() => {
    process.env = ENV;
  });

  it('Should pass with default values', async () => {
    delete process.env.PORT;
    delete process.env.HOST;

    const env = EnvironmentWrapper();
    expect(env.ENV).toEqual('test');
    expect(env.PORT).toEqual(8000);
    expect(env.HOST).toEqual('0.0.0.0');
    expect(env.LOGS_PATH).toEqual('logs');
  });

  it('Should pass with defined values', async () => {
    process.env.NODE_ENV = 'development';
    process.env.PORT = '5000';
    process.env.HOST = '101.101.101.101';
    process.env.LOGS_PATH= 'logDir';
    const env = EnvironmentWrapper();
    expect(env.ENV).toEqual(process.env.NODE_ENV);
    expect(env.PORT).toEqual(parseInt(process.env.PORT));
    expect(env.HOST).toEqual(process.env.HOST );
    expect(env.LOGS_PATH).toEqual(process.env.LOGS_PATH= 'logDir');
  });

  it('Should exit with 0, Bad port', async () => {
    process.env.PORT = 'abc';
    const mockExit = jest.spyOn(process, 'exit').mockImplementation();
    EnvironmentWrapper();
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it('Should exit with 0, Bad host', async () => {
    process.env.HOST = 'library';
    const mockExit = jest.spyOn(process, 'exit').mockImplementation();
    EnvironmentWrapper();
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
