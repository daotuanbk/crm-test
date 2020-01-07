import request from 'supertest';
import { Auth } from './auth';
import { server } from '../../src/server';
const API_ROLE = '/api/roles';

export async function getRole(name = 'salesman'): Promise<any> {
  expect(Auth.idToken).not.toBe('');
  const res = await request(server)
    .get(API_ROLE)
    .query({ first: 10, search: name })
    .set('Authorization', `Bearer ${Auth.idToken}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');
  expect(res.status).toBe(200);
  expect(res.body).toBeInstanceOf(Object);
  expect(res.body.data).toBeInstanceOf(Array);
  const selectedRole = res.body.data.filter((role: any): any => role.name.toLowerCase() === name.toLowerCase())[0];
  expect(selectedRole).not.toBe(undefined);
  expect(selectedRole.id).not.toBe(undefined);
  return selectedRole;
}
