const request = require('supertest');
const app = require('../src/app');
const { User, ROLES } = require('../src/models/User');

describe('Authentication API', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  const validUser = {
    username: 'test_user123',
    name: 'Test User',
    email: 'test@multischool.com',
    mobile: '1234567890',
    password: 'Password@123',
    role: ROLES.SUPERADMIN,
  };

  it('should register a new user successfully', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(validUser);
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/Registration successful/);
  });

  it('should not register user with duplicate email', async () => {
    await request(app).post('/api/v1/auth/register').send(validUser);
    const res = await request(app).post('/api/v1/auth/register').send(validUser);
    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('should login successfully with correct credentials', async () => {
    await request(app).post('/api/v1/auth/register').send(validUser);
    const res = await request(app).post('/api/v1/auth/login').send({
      identifier: validUser.email,
      password: validUser.password,
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('should reject login with wrong password', async () => {
    await request(app).post('/api/v1/auth/register').send(validUser);
    const res = await request(app).post('/api/v1/auth/login').send({
      identifier: validUser.email,
      password: 'WrongPassword@123',
    });
    expect(res.statusCode).toEqual(401);
  });
});
