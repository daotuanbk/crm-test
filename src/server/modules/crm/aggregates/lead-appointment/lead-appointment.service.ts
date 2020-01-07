import {
  LeadAppointmentInputError,
  EntityNotFoundError,
  validateQuery,
  ensurePermission,
  validatePayload,
  validateOperation,
  UserInputError,
} from '@app/core';
import { LeadAppointmentService } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';

const leadAppointmentService: LeadAppointmentService = {
  setup: (_app, _path) => {
    //
  },
  find: async ({ query, repository, authUser }) => {
    validateOperation(query.operation || 'getAll', ['getAll', 'getByLeadId']);

    // 1. authorize
    ensurePermission(authUser, PERMISSIONS.LEAD_APPOINTMENTS.VIEW);

    return await leadAppointmentService[query.operation]({query, repository});
  },
  getByLeadId: async ({query, repository}) => {
    const fields = JSON.parse(query.fields);
    // 1. validate
    if (!fields || !fields.leadId) {
      throw new UserInputError('Query.leadId is invalid');
    }
    const result = await repository.findByLeadId(fields.leadId);
    return {
      data: result,
    };
  },
  getAll: async ({query, repository}) => {
    // 1. validate
    validateQuery(query);

    // 2. persist to db
    return await repository.find(query);
  },
  get: async (id, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_APPOINTMENTS.VIEW);

    // 2. validate
    if (!id) {
      throw new LeadAppointmentInputError(params.translate('missingId'));
    }

    // 3. do business logic

    // 4. persist to db
    return await params.repository.findById(id);
  },
  create: async (data, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_APPOINTMENTS.CREATE);

    // 2. validate
    await validatePayload({
      // Validate object
    }, data);

    // 3. do business logic

    // 4. persist to db
    const _id = await params.repository.create({
      ...data,
      ...params.creationInfo,
    });

    return {
      id : _id,
      _id,
    };
  },
  patch: async (id, data, params) => {
    validateOperation(data.operation, ['updateDetail']);
    await leadAppointmentService[data.operation](id, data.payload, params);
    return {};
  },
  updateDetail: async (id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_APPOINTMENTS.EDIT);

    // 2. validate
    if (!id) {
      throw new LeadAppointmentInputError(params.translate('missingId'));
    }
    const existedLeadAppointment: any = await params.repository.findById(id);
    if (!existedLeadAppointment) {
      throw new EntityNotFoundError('LeadAppointment');
    }
    const validationSchema = yup.object().shape({
      //
    });
    await validationSchema.validate(data);
    // 3. do business logic

    // 4. persist to db
    await params.repository.update({
      id,
      ...data,
      ...params.modificationInfo,
    });
    return {};
  },
  remove: async (id, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_APPOINTMENTS.DELETE);

    // 2. validate
    if (!id) {
      throw new LeadAppointmentInputError(params.translate('missingId'));
    }
    const existedLeadAppointment: any = await params.repository.findById(id);
    if (!existedLeadAppointment) {
      throw new EntityNotFoundError('LeadAppointment');
    }

    // 3. persist to db
    await params.repository.del(id);
    return {};
  },
};

export default leadAppointmentService;
