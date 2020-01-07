import request from 'supertest';
import { getIdToken, mongoDatabase } from '@app/core';
import { config } from '@app/config';
import { server } from '../../../../../src/server';
import { decode, onePermissionOK } from '../../../../../src/server/modules/crm/aggregates/leads/services/updateOwner';
import { PERMISSIONS } from '../../../../../src/common/permissions';

const salemanTC1 =  {
  id: 'tc.sale1',
  centreId: 'tc',
  permissions: [],
  isGM: false,
  isSaleHO: false,
};
const salemanTC2 = {
  id: 'tc.sale2',
  centreId: 'tc',
  permissions: [],
  isGM: false,
  isSaleHO: false,

};
const salemanTC3 = {
  id: 'tc.sale3',
  centreId: 'tc',
  permissions: [],
  isGM: false,
  isSaleHO: false,

};

const GMTC = {
  id: 'tc.gm',
  centreId: 'tc',
  permissions: [],
  isGM: true,
  isSaleHO: false,

};

const GMHDT = {
  id: 'hdt.gm',
  centreId: 'hdt',
  permissions: [],
  isGM: true,
  isSaleHO: false,

};

const salemanHDT = {
  id: 'hdt.sale',
  centreId: 'hdt',
  permissions: [],
  isGM: false,
  isSaleHO: false,

};

const saleHO = {
  id: 'ho.sale',
  centreId: 'ho',
  permissions: [],
  isGM: false,
  isSaleHO: true,
};

const leads = {
  tc: {
    sale1: {
      centreId: 'tc',
      ownerId: 'tc.sale1',
    },
    sale2: {
      centreId: 'tc',
      ownerId: 'tc.sale2',
    },
    gm: {
      centreId: 'tc',
      ownerId: 'tc.gm',
    },

  },
  hdt: {
    sale: {
      centreId: 'hdt',
      ownerId: 'hdt.sale',
    },
  },
  ho: {
    sale: {
      centreId: 'ho',
      ownerId: 'ho.sale',
    },
  },
  noOwner: {
    sale: {
    },
  },

};

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

const leadPayload = {
  userType: 'parent',
  gender: 'male',
  firstName: 'minh',
  lastName: 'duc',
  address: '22c,thanh cong',
  centre: '5c7feee8568ccae9b6e3861a',
  discountType: 'PERCENT',
  discountValue: 0,
  showDiscount: false,
  currentStage: 'New',
  dob: '2019-11-25T07:15:48.453Z',
  email: 'minhduc.096.99@gmail.com',
  fileList: [],
  owner: 'q45aTgEkvpaWKBpLAsNp9lHcuRr2',
  relationName: 'minh duc',
  remaining: 0,
  totalAfterDiscount: 0,
  courses: [
    {
      index: '4a78c9d2-42b3-4279-af19-204b3e40bd34',
      courseId: '5dc101d121b04b236df1f8fd',
      discountType: 'PERCENT',
      discountValue: 0,
      showDiscount: false,
    },
  ],
};

describe('check permissions function', () => {
  describe('saleman', () => {
    it('should not permitted', (done) => {
      const SALEMANPERM = PERMISSIONS.LEAD_OWNER.SALESMAN;
      const perm = decode(SALEMANPERM);
      let result = onePermissionOK(perm,
        salemanTC1,
        leads.tc.sale2,
        salemanTC3,
      );
      expect(result).toBeFalsy();

      result = onePermissionOK(perm,
        salemanTC1,
        leads.noOwner.sale,
        salemanTC3,
      );
      expect(result).toBeFalsy();

      result = onePermissionOK(perm,
        salemanTC1,
        leads.tc.sale1,
        salemanHDT,
      );
      expect(result).toBeFalsy();
      done();
    });

    it('should be permitted', (done) => {
      const SALEMANPERM = PERMISSIONS.LEAD_OWNER.SALESMAN;
      const perm = decode(SALEMANPERM);
      let result = onePermissionOK(perm,
        salemanTC1,
        leads.tc.sale1,
        salemanTC3,
      );
      expect(result).toBeTruthy();

      result = onePermissionOK(perm,
        salemanTC2,
        leads.tc.sale2,
        GMTC,
      );
      expect(result).toBeTruthy();
      done();
    });
  });
  describe('GM', () => {
    it('should not permitted', (done) => {
      const gmInCentrePERM = PERMISSIONS.LEAD_OWNER.GM_WITHIN_CENTRE;
      const gmToGmPERM = PERMISSIONS.LEAD_OWNER.GM_TO_GM;
      let perm = decode(gmInCentrePERM);
      let result = onePermissionOK(perm,
        GMTC,
        leads.hdt.sale,
        salemanTC3,
      );
      expect(result).toBeFalsy();

      perm = decode(gmToGmPERM);
      result = onePermissionOK(perm,
        GMTC,
        leads.hdt.sale,
        salemanTC3,
      );
      expect(result).toBeFalsy();

      expect(result).toBeFalsy();
      done();
    });

    it('should be permitted', (done) => {
      const gmInCentrePERM = PERMISSIONS.LEAD_OWNER.GM_WITHIN_CENTRE;
      const gmToGmPERM = PERMISSIONS.LEAD_OWNER.GM_TO_GM;
      let perm = decode(gmInCentrePERM);
      let result = onePermissionOK(perm,
        GMTC,
        leads.tc.sale2,
        salemanTC3,
      );
      expect(result).toBeTruthy();

      perm = decode(gmToGmPERM);
      result = onePermissionOK(perm,
        GMTC,
        leads.tc.sale2,
        GMHDT,
      );
      expect(result).toBeTruthy();
      done();
    });
  });

  describe('HO', () => {
    it('should not permitted', (done) => {

      let perm = decode(PERMISSIONS.LEAD_OWNER.SALE_HO_ASSIGN);
      let result = onePermissionOK(perm,
        saleHO,
        leads.hdt.sale,
        salemanTC3,
      );
      expect(result).toBeFalsy();

      result = onePermissionOK(perm,
        saleHO,
        leads.noOwner.sale,
        salemanHDT,
      );
      expect(result).toBeFalsy();
      perm = decode(PERMISSIONS.LEAD_OWNER.SALE_HO_TO_SALE_HO);
      result = onePermissionOK(perm,
        saleHO,
        leads.noOwner.sale,
        salemanHDT,
      );
      expect(result).toBeFalsy();
      perm = decode(PERMISSIONS.LEAD_OWNER.SALE_HO_ASSIGN_TO_SALE_HO);
      result = onePermissionOK(perm,
        saleHO,
        leads.tc.gm,
        saleHO,
      );
      expect(result).toBeFalsy();
      perm = decode(PERMISSIONS.LEAD_OWNER.SALE_HO_TO_SALE_HO);
      result = onePermissionOK(perm,
        saleHO,
        leads.ho.sale,
        salemanTC2,
      );
      expect(result).toBeFalsy();
      done();
    });

    it('should be permitted', (done) => {
      let perm = decode(PERMISSIONS.LEAD_OWNER.SALE_HO_ASSIGN);
      let result = onePermissionOK(perm,
        saleHO,
        leads.noOwner.sale,
        GMHDT,
      );
      expect(result).toBeTruthy();
      perm = decode(PERMISSIONS.LEAD_OWNER.SALE_HO_TO_GM);
      result = onePermissionOK(perm,
        saleHO,
        leads.ho.sale,
        GMTC,
      );
      expect(result).toBeTruthy();
      perm = decode(PERMISSIONS.LEAD_OWNER.SALE_HO_ASSIGN_TO_SALE_HO);
      result = onePermissionOK(perm,
        saleHO,
        leads.noOwner.sale,
        saleHO,
      );
      expect(result).toBeTruthy();
      done();

      perm = decode(PERMISSIONS.LEAD_OWNER.SALE_HO_TO_SALE_HO);
      result = onePermissionOK(perm,
        saleHO,
        leads.ho.sale,
        saleHO,
      );
      expect(result).toBeTruthy();
      done();
    });
  });
});

describe('Leads API', () => {
  describe('GET /leads', () => {
    it('should have HTTP code 200 and return data when provide proper args', async (done) => {
      const res = await request(server)
        .get(`/api/leads`)
        .set('Authorization', `Bearer ${idToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pages');
      expect(res.body).toHaveProperty('count');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
      done();
    });
  });
  describe('POST /leads', () => {
    it('should create new lead and add note, reminder, appointment then delete that lead', async (done) => {
      let res = await request(server)
        .post(`/api/leads`)
        .set('Authorization', `Bearer ${idToken}`)
        .send(leadPayload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      const newLead = res.body;
      const leadId = newLead.id;
      res = await request(server)
        .get(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${idToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toEqual(newLead);

      res = await request(server)
        .post(`/api/leads/${leadId}/notes`)
        .set('Authorization', `Bearer ${idToken}`)
        .send({content: 'this is a note'});

      expect(res.status).toBe(201);

      res = await request(server)
        .post(`/api/leads/${leadId}/reminders`)
        .set('Authorization', `Bearer ${idToken}`)
        .send({
          title: 'this is a reminder',
          dueAt: '2020-11-25T09:58:21+0000',
        });

      expect(res.status).toBe(201);

      const reminderId = res.body._id;
      res = await request(server)
        .patch(`/api/leads/${leadId}/reminders/${reminderId}`)
        .set('Authorization', `Bearer ${idToken}`)
        .send({
          title: 'this is a reminder',
          dueAt: '2020-11-25T09:58:21+0000',
        });

      expect(res.status).toBe(200);

      res = await request(server)
        .post(`/api/leads/${leadId}/appointments`)
        .set('Authorization', `Bearer ${idToken}`)
        .send({
          title: 'this is a appointment',
          time: '2020-11-26T09:58:21+0000',
          centreId: '5c7feee8568ccae9b6e3861a',
          currentStatus: 'WAITING',
        });

      expect(res.status).toBe(201);

      const appointmentId = res.body._id;
      res = await request(server)
        .patch(`/api/leads/${leadId}/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${idToken}`)
        .send({
          currentStatus: 'WAITING',
        });

      expect(res.status).toBe(200);

      res = await request(server)
        .delete(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${idToken}`);

      expect(res.status).toBe(200);

      res = await request(server)
        .get(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${idToken}`);

      expect(res.status).not.toBe(200);
      done();
    });
  });
});

// POST Lead =? id
  // GET /leads/{id}
  // POST /leads/notes
  // POST /leads/{leadId}/reminders
  // PATCH /leads/{leadId}/reminders/{reminderId}
  // POST /leads/{leadId}/appointments
  // PATCH /leads/{leadId}/appointments/{appointmentId}
  // DELETE Lead => OK?
