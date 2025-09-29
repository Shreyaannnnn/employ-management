import request from 'supertest';
import { createApp } from '../src/app';
import '../src/db/migrate';

const app = createApp();

describe('Auth', () => {
  it('logs in with seeded admin user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com', password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });
});



