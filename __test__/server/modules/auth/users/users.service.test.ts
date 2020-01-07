import request from 'supertest';
import { getIdToken, mongoDatabase } from '@app/core';
import { config } from '@app/config';
import { server } from '../../../../../src/server';

let idToken = '';

beforeAll(async (done) => {
  await mongoDatabase.startDatabase(config.database.testConnectionString);
  idToken = await getIdToken();
  done();
});

afterAll((done) => {
  mongoDatabase.stopDatabase();
  done();
});

describe('Users API', () => {
  describe('GET /users', () => {
    it('should return error when not provide Bearer token', async (done) => {
      const res = await request(server)
        .get(`/api/users`)
        .set('Authorization', `Bearer`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');

      expect(res.status).toBe(500);
      done();
    });

    it('should return error when not provide proper args', async (done) => {
      const res = await request(server)
        .get(`/api/users`)
        .set('Authorization', `Bearer ${idToken}`);

      expect(res.status).toBe(500);
      done();
    });

    it('should have HTTP code 200 and return data when provide proper args', async (done) => {
      const res = await request(server)
        .get(`/api/users?first=50&sortBy=createdAt|desc`)
        .set('Authorization', `Bearer ${idToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      done();
    });
  });
});
