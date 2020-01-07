import {
  CentreInputError,
  EntityNotFoundError,
  validateQuery,
  ensurePermission,
  validatePayload,
  validateOperation, UserInputError, getFileName,
} from '@app/core';
import { LeadAttachmentService, leadAttachmentRepository } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';

/*const detechTypeFile = (filename = '') => {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return;
  const fileType = filename.slice(lastDot + 1).trim();
}*/

// @ts-ignore
const leadAttachmentService: LeadAttachmentService = {
  setup: (_app, _path) => {
    //
  },
  find: async ({ query, repository, authUser }) => {
    // 1. authorize
    ensurePermission(authUser, PERMISSIONS.LEAD_ATTACHMENTS.VIEW);

    if (!query.operation) {
      // 2. validate
      validateQuery(query);

      // 3. do business logic

      // 4. persist to db
      return await repository.find(query);
    } else {
      validateOperation(query.operation, ['getByLeadOrContactId']);
      return await leadAttachmentService[query.operation]({query, repository});
    }
  },
  get: async (_id, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_ATTACHMENTS.VIEW);

    // 2. validate
    if (!_id) {
      throw new CentreInputError(params.translate('missingId'));
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
    ensurePermission(params.authUser, PERMISSIONS.LEAD_ATTACHMENTS.CREATE);

    // 2. validate
    await validatePayload({
      // Validate object
    }, data);

    // 3. do business logic

    // 4. persist to db
    const title = data.title || getFileName(data.url);
    const _id = await params.repository.create({
      ...data,
      title,
      ...params.creationInfo,
    });

    return {
      id : _id,
    };
  },
  patch: async (id, data, params) => {
    validateOperation(data.operation, ['updateDetail']);
    await leadAttachmentService[data.operation](id, data.payload, params);
    return {};
  },
  updateDetail: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_ATTACHMENTS.EDIT);

    // 2. validate
    if (!_id) {
      throw new CentreInputError(params.translate('missingId'));
    }
    const existedCentre: any = await params.repository.findById(_id);
    if (!existedCentre) {
      throw new EntityNotFoundError('Centre');
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
  getByFbConversationId: async (fbConversationId) => {
    return await leadAttachmentRepository.getByFbConversationId(fbConversationId);
  },
};

export default leadAttachmentService;
