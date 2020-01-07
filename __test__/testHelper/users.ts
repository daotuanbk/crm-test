import request from 'supertest';
import { Auth } from './auth';
import { server } from '../../src/server';
import _ from 'lodash';
import { createPostJson } from './request';

const API_USER = '/api/users';

export function hasOneOfRole(user: any, roles: string|string[]) {
  return user.roles.reduce((prevRoleResult: boolean, role: any): boolean => (
      prevRoleResult
      || (roles instanceof Array && roles.includes(role))
      || (roles instanceof String && roles === role)
    ),
    false,
  );
}

export async function getOnlyOneUserBy(search: string): Promise<any> {
  expect(Auth.idToken).not.toBe('');
  const res = await request(server)
    .get(API_USER)
    .query({ search, first: 10 })
    .set('Authorization', `Bearer ${Auth.idToken}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');
  expect(res.status).toBe(200);
  expect(res.body.data.length).toBe(1);
  return res.body.data[0];
}

export async function getUserBy(
    roles: string|string[],
    centreId?: string,
    exludeId?: string,
    excludeCentreId?: string,
    excludeRoleIds?: string|string[]): Promise<any> {
  expect(Auth.idToken).not.toBe('');
  const res = await request(server)
    .get(API_USER)
    .query({ roles, first: 10 })
    .set('Authorization', `Bearer ${Auth.idToken}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');
  expect(res.status).toBe(200);
  expect(res.body).toBeInstanceOf(Object);
  expect(res.body.data).toBeInstanceOf(Array);
  const users = res.body.data;
  expect(
    users.reduce(
      (prevResult: boolean, user: any): boolean => prevResult && hasOneOfRole(user, roles),
      true,
  ));
  const localExludeRoleIds = _.flatten([excludeRoleIds]);
  const selectedUsers = res.body.data.filter((user: any): boolean => {
    return user.centreId
      && (!centreId || (centreId === user.centreId))
      && (!excludeCentreId || (excludeCentreId !== user.centreId))
      && (!exludeId || (user.id !== exludeId))
      && (!localExludeRoleIds || ([] === _.difference(localExludeRoleIds, _.map(user.roles, '_id'))));
  });
  expect(selectedUsers.length).not.toBe(0);
  const selectedUser = selectedUsers[0];
  expect(selectedUser).toBeTruthy();
  expect(selectedUser.id).toBeTruthy();
  expect(selectedUser.centreId).toBeTruthy();
  return selectedUser;
}
