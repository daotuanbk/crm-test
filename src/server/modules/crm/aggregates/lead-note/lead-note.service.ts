import {
  LeadNoteInputError,
  EntityNotFoundError,
  ensurePermission,
  validatePayload,
  validateOperation,
  validateQuery, UserInputError,
} from '@app/core';
import { LeadNoteService } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';
// import { Response } from 'express';
// import { leadNoteRepository } from './leadNotes.repository';

const leadNotesService: LeadNoteService = {
  setup: (_app, _path) => {
    //
  },
  find: async ({ query, repository, authUser }) => {
    // 1. authorize
    ensurePermission(authUser, PERMISSIONS.LEAD_NOTE.VIEW);

    // 2. validate

    // 3. do business logic

    // 4. persist to db
    if (!query.operation) {
      // 2. validate
      validateQuery(query);

      // 3. do business logic

      // 4. persist to db
      return await repository.find(query);
    } else {
      validateOperation(query.operation, ['getByLeadOrContactId']);
      return await leadNotesService[query.operation]({query, repository});
    }
  },
  get: async (_id, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_NOTE.VIEW);

    // 2. validate
    if (!_id) {
      throw new LeadNoteInputError(params.translate('missingId'));
    }

    // 3. do business logic

    // 4. persist to db
    return await params.repository.findById(_id);
  },
  getByLeadOrContactId: async ({query, repository}) => {
    const fields = JSON.parse(query.fields);
    // 1. validate
    if (!fields) {
      throw new UserInputError('Query is invalid');
    }
    const result = await repository.findByLeadOrContactId(fields.leadId, fields.contactId);
    return {
      data: result,
    };
  },
  create: async (data, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_NOTE.CREATE);

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
    validateOperation(data.operation, ['updateDetail']);
    await leadNotesService[data.operation](id, data.payload, params);
    return {};
  },
  updateDetail: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_NOTE.EDIT);

    // 2. validate
    if (!_id) {
      throw new LeadNoteInputError(params.translate('missingId'));
    }
    const existedLeadNote: any = await params.repository.findById(_id);
    if (!existedLeadNote) {
      throw new EntityNotFoundError('LeadNote');
    }
    const validationSchema = yup.object().shape({
      //
    });
    await validationSchema.validate(data);

    // 3. do business logic

    // 4. persist to db
    await params.repository.update({
      id: _id,
      ...data,
      ...params.modificationInfo,
    });
    return {};
  },
};

export default leadNotesService;
