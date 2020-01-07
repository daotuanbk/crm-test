import { EntityNotFoundError, validateQuery, ensurePermission, validatePayload, validateOperation, generateFullName } from '@app/core';
import { MappingContactInfoService, leadRepository, contactRepository, leadPaymentTransactionRepository, rootContactRepository } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';
import * as uuid from 'uuid';
import slugify from 'slugify';
import _ from 'lodash';
// import { Response } from 'express';
// import { mappingContactInfoRepository } from './mappingContactInfo.repository';

const mappingContactInfoService: MappingContactInfoService = {
  setup: (_app, _path) => {
    //
  },
  find: async ({ query, repository, authUser }) => {
    // 1. authorize

    // 2. validate

    // 3. do business logic

    // 4. persist to db
    if (!query.operation) {
      ensurePermission(authUser, PERMISSIONS.LEADS.VIEW);
      validateQuery(query);
      return await repository.find(query);
    } else {
      validateOperation(query.operation, ['findLeadsAndTransactions', 'findByKey']);
      return await mappingContactInfoService[query.operation]({ query, repository, authUser });
    }
  },
  findLeadsAndTransactions: async ({ query, repository, authUser }) => {
    if (authUser.fromLms) {
      // Do business
      if (query.email || query.phone || query.id) {
        const fullName = slugify(generateFullName({
          firstName: query.firstName || '',
          lastName: query.lastName || '',
        }));
        const reverseFullName = slugify(generateFullName({
          firstName: query.firstName || '',
          lastName: query.lastName || '',
        }, true));
        const nameObj = {
          fullName,
          reverseFullName,
        };
        const mapping = await repository.findAllByKey(query.email, query.phone, nameObj);
        const deepCloneMapping = JSON.parse(JSON.stringify(mapping));
        let rootContact;
        if (query.id) {
          rootContact =  await rootContactRepository.findByStudentId(query.id);
        }
        let rootContactIds = [];
        if (rootContact && rootContact.length) {
          rootContactIds = JSON.parse(JSON.stringify(rootContact)).map((val: any) => val._id);
        } else {
          rootContactIds = _.uniq(deepCloneMapping.map((val: any) => val && val.refId ? val.refId : null)).filter((v: any) => v);
        }
        const contacts = await contactRepository.findInArrayId(rootContactIds);
        const deepCloneContacts = JSON.parse(JSON.stringify(contacts));
        const contactIds = deepCloneContacts.map((val: any) => val._id);
        const leads = await leadRepository.findByCriteria({'contact._id': {$in: contactIds}});
        const deepCloneLeads = JSON.parse(JSON.stringify(leads));
        const transactionPromises = deepCloneLeads.map((val: any) => {
          return leadPaymentTransactionRepository.find({leadId: val._id} as any);
        });
        const transactions = await Promise.all(transactionPromises);
        const deepCloneTransactions = JSON.parse(JSON.stringify(transactions));
        const mergedTransactions = [].concat.apply([], deepCloneTransactions);
        const data = deepCloneLeads.map((val: any) => {
          const deepClone = JSON.parse(JSON.stringify(val));
          const leadTransactions = mergedTransactions.filter((v: any) => v.leadId === val._id);
          deepClone.transactions = leadTransactions;
          return deepClone;
        });
        return {
          data,
        };
      } else {
        return {
          data: [],
        };
      }
    } else {
      return {};
    }
  },
  findByKey: async ({ query, repository }) => {
    if (query.key) {
      return await repository.findAllByKey(query.key);
    } else {
      return [];
    }
  },
  get: async (_id, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LISTS.VIEW);

    // 2. validate
    if (!_id) {
      throw new Error(params.translate('missingId'));
    }

    // 3. do business logic

    // 4. persist to db
    return await params.repository.findById(_id);
  },
  create: async (data, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LISTS.CREATE);

    // 2. validate
    await validatePayload({
      // Validate object
    }, data);

    // 3. do business logic

    // 4. persist to db
    const id = await params.repository.create({
      ...data,
      ...params.creationInfo,
    });

    return {
      id,
    };
  },
  patch: async (id, data, params) => {
    validateOperation(data.operation, ['updateDetail', 'syncLmsId', 'removeLmsStudent']);
    await mappingContactInfoService[data.operation](id, data.payload, params);
    return {};
  },
  updateDetail: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LISTS.EDIT);

    // 2. validate
    if (!_id) {
      throw new Error(params.translate('missingId'));
    }
    const existedMappingContactInfo: any = await params.repository.findById(_id);
    if (!existedMappingContactInfo) {
      throw new EntityNotFoundError('MappingContactInfo');
    }
    const validationSchema = yup.object().shape({
      //
    });
    await validationSchema.validate(data);

    // 3. do business logic

    // 4. persist to db
    await params.repository.update({
      _id,
      ...data,
      ...params.modificationInfo,
    });
    return {};
  },
  syncLmsId: async (_id, data, params) => {
    const payload = {
      contactBasicInfo: {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email ? data.email.constructor === Array ? data.email : [data.email] : [],
        phone: data.phone ? data.phone.constructor === Array ? data.phone : [data.phone] : [],
        fb: data.fb ? data.fb.constructor === Array ? data.fb : [data.fb] : [],
        address: data.address || '',
        gender: data.gender || '',
        dob: data.dob || '',
        userType: 'student',
      },
      contactRelations: [{
        index: uuid.v4(),
        userType: 'parent',
        firstName: data.parentFirstName || '',
        lastName: data.parentLastName || '',
        fullName: ((data.parentFirstName ? data.parentFirstName : '') + (data.parentFirstName ? ' ' : '')  +
              (data.parentLastName ? data.parentLastName : '')),
        email: data.parentEmail ? (data.parentEmail.constructor === Array ? data.parentEmail : [data.parentEmail]) : [],
        phone: data.parentPhone ? (data.parentPhone.constructor === Array ? data.parentPhone : [data.parentPhone]) : [],
        fb: data.parentFb ? (data.parentFb.constructor === Array ? data.parentFb : [data.parentFb]) : [],
        relation: data.relation || '',
      }],
      lmsStudentId: data.studentId,
    };
    const rootContact = await rootContactRepository.findByStudentId(data.studentId);
    if (rootContact && rootContact.length) {
      await rootContactRepository.syncDataFromLms({lmsStudentId: data.studentId}, payload);
    } else {
      const fullName = slugify(generateFullName({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
      }));
      const reverseFullName = slugify(generateFullName({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
      }, true));
      const mapping = await params.repository.findAllByKey(data.email, data.phone, {
        fullName,
        reverseFullName,
      });
      const deepCloneMapping = JSON.parse(JSON.stringify(mapping));
      const rootContactIds = deepCloneMapping.map((val: any) => val.refId);
      if (rootContactIds && rootContactIds.length) {
        await rootContactRepository.updateLmsStudentId(rootContactIds, data.studentId, payload);
      } else {
        await rootContactRepository.create({
          contactBasicInfo: {
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email ? data.email.constructor === Array ? data.email : [data.email] : [],
            phone: data.phone ? data.phone.constructor === Array ? data.phone : [data.phone] : [],
            fb: data.fb ? data.fb.constructor === Array ? data.fb : [data.fb] : [],
            address: data.address || '',
            gender: data.gender || '',
            dob: data.dob || '',
            userType: 'student',
          },
          contactRelations: [{
            index: uuid.v4(),
            userType: 'parent',
            firstName: data.parentFirstName || '',
            lastName: data.parentLastName || '',
            email: data.parentEmail ? data.parentEmail.constructor === Array ? data.parentEmail : [data.parentEmail] : [],
            phone: data.parentPhone ? data.parentPhone.constructor === Array ? data.parentPhone : [data.parentPhone] : [],
            fb: data.parentFb ? data.parentFb.constructor === Array ? data.parentFb : [data.parentFb] : [],
            relation: data.relation || '',
          }],
          lmsStudentId: data.studentId,
        } as any);
      }
    }
    return {};
  },
  removeLmsStudent: async (_id, data, _params) => {
    if (data && data.studentId) {
      await rootContactRepository.updateOne({lmsStudentId: data.studentId}, {lmsStudentId: undefined});
    } else {
      //
    }
    return {};
  },
};

export default mappingContactInfoService;
