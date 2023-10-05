import request from 'supertest';
import { createServer } from '@config/express.config';

describe('Server', () => {
  const app = createServer();

  it('should pass', async () => {
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
  });
});