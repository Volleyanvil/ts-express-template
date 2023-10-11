import request from 'supertest';
import { createServer } from '@config/express.config';

describe('Server', () => {
  const app = createServer();

  it('Should return health UP', async () => {
    const response = await request(app).get('/health');
    expect(response.text).toBe('UP');
    expect(response.statusCode).toBe(200);
  });

  it('should pass', async () => {
    const response = await request(app).get('/');
    expect(response.text).toBe('Main route home page.');
    expect(response.statusCode).toBe(200);
  });
});