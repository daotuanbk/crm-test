
import request from 'supertest';
import { server } from '../../src/server';
import { Auth } from './auth';
import { createPostJson, createDelete } from './request';

const API_LEAD = '/api/leads';

const postLead = createPostJson(API_LEAD);
const deleteLead = createDelete(API_LEAD);

export async function getLeads(centreId?: string, ownerId?: string, first = 20) {
  const centreFilter = centreId ? {
    ['filter[].centre._id']: `centre._id|${centreId}`,
  } : {};
  const ownerFilter = ownerId ? {
    ['filter[0].owner.id']: `owner.id|${ownerId}`,
  } : {} ;
  const res = await request(server)
    .get(API_LEAD)
    .query({
      first,
      ...centreFilter,
      ...ownerFilter,
    })
    .set('Authorization', `Bearer ${Auth.idToken}`);

  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('data');
  expect(res.body.data).toBeInstanceOf(Array);
  expect(res.body.data.length).toBeGreaterThan(0);
  if (centreId) {
    expect(res.body.data.reduce((prev: boolean, lead: any): boolean => prev && (lead.centre._id === centreId), true))
      .toBeTruthy();
  }

  return res.body.data;
}

export async function addLead(firstName: string, lastName: string, centreId?: string, ownerId?: string, userType= 'student', stage= 'New') {
  const centreJson = centreId ? { centre: centreId } : {};
  const ownerJson = ownerId ? { owner: ownerId } : {};
  const leadJson = {
    currentStage: stage,
    firstName,
    lastName,
    ...centreJson,
    ...ownerJson,
    courses: [],
    userType,
  };
  const result = await postLead(leadJson);
  expect(result.status).toBe(201);
  return result.body.id;
}

export async function deleteLeadBy(leadId: string): Promise<any> {
  await deleteLead(leadId);
}
