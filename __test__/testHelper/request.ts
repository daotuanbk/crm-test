import { Auth } from './auth';
import { server } from '../../src/server';
import request from 'supertest';

export function createPostJson(apiUrl: string): any {
  return (json: any): any => {
    return request(server)
      .post(apiUrl)
      .set('Authorization', `Bearer ${Auth.idToken}`)
      .send(json)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
  };
}

export function createDelete(apiUrl: string): any {
  return (id: string): any => {
    return request(server)
      .delete(apiUrl + `/${id}`)
      .set('Authorization', `Bearer ${Auth.idToken}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
  };
}
