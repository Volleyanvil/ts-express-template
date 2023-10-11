import express from 'express';
import { Server } from 'net';

console.log('process.version', process.version, ' ENV:', process.env.NODE_ENV);

// NOTE: Unit testing an index file that only launches the server is largely unnecessary

describe('Index', () => {
  const ENV: NodeJS.ProcessEnv = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = {...ENV};
    process.env.NODE_ENV = ENV.NODE_ENV;
    process.env.HOST = '0.0.0.0';
    process.env.PORT = '8000';
  });
  afterAll(() => {
    process.env = ENV;
  });

  it('should work', async () => {
    const listen = jest.spyOn(Server.prototype, 'listen');
    jest.mock('@config/express.config', () => ({
      createServer: jest.fn().mockReturnValue(express()),
    }));

    await import('@server/index');
    expect(listen).toBeCalled();

    const server = listen.mock.results[0].value as Server;
    setImmediate(() => {
      server.close();
    });
    listen.mockRestore();
  });
});
