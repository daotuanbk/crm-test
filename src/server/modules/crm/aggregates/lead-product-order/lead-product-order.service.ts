import { LeadProductOrderInputError, EntityNotFoundError, validateQuery, ensurePermission, validatePayload, validateOperation } from '@app/core';
import { LeadProductOrderService, leadRepository } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';
// import { Response } from 'express';
// import { leadProductOrderRepository } from './leadProductOrder.repository';

const leadProductOrderService: LeadProductOrderService = {
  setup: (_app, _path) => {
    //
  },
  find: async ({ query, repository, authUser }) => {
    // 1. authorize
    ensurePermission(authUser, PERMISSIONS.LEAD_PO.VIEW);

    // 2. validate
    validateQuery(query);

    // 3. do business logic

    // 4. persist to db
    return await repository.find(query);
  },
  get: async (_id, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_PO.VIEW);

    // 2. validate
    if (!_id) {
      throw new LeadProductOrderInputError(params.translate('missingId'));
    }

    // 3. do business logic

    // 4. persist to db
    return await params.repository.findById(_id);
  },
  create: async (data, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_PO.CREATE);

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

    await leadRepository.update({
      id: data.leadId,
      productOrder: {
        _id,
        courseCount: 0,
        courses: [],
        comboId: undefined,
        comboName: undefined,
      } as any,
    });

    return {
      id: _id,
    };
  },
  patch: async (id, data, params) => {
    validateOperation(data.operation, ['updateDetail', 'updateCourses', 'deleteCourse', 'addCourse', 'addCombo', 'removeCombo']);
    await leadProductOrderService[data.operation](id, data.payload, params);
    return {};
  },
  updateDetail: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_PO.EDIT);

    // 2. validate
    if (!_id) {
      throw new LeadProductOrderInputError(params.translate('missingId'));
    }
    const existedLeadProductOrder: any = await params.repository.findById(_id);
    if (!existedLeadProductOrder) {
      throw new EntityNotFoundError('LeadProductOrder');
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
  updateCourses: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_PO.EDIT);

    // 2. validate
    if (!_id) {
      throw new LeadProductOrderInputError(params.translate('missingId'));
    }
    const existedLeadProductOrder: any = await params.repository.findById(_id);
    if (!existedLeadProductOrder) {
      throw new EntityNotFoundError('LeadProductOrder');
    }
    const validationSchema = yup.object().shape({
      //
    });
    await validationSchema.validate(data);

    // 3. do business logic

    // 4. persist to db
    await params.repository.updateCourses(_id, {
      ...data,
      ...params.modificationInfo,
    });
    return {};
  },
  deleteCourse: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_PO.EDIT);

    // 2. validate
    if (!_id) {
      throw new LeadProductOrderInputError(params.translate('missingId'));
    }
    const existedLeadProductOrder: any = await params.repository.findById(_id);
    if (!existedLeadProductOrder) {
      throw new EntityNotFoundError('LeadProductOrder');
    }
    const validationSchema = yup.object().shape({
      //
    });
    await validationSchema.validate(data);

    // 3. do business logic

    // 4. persist to db
    await params.repository.deleteCourse(_id, {
      ...data,
      ...params.modificationInfo,
    });
    return {};
  },
  addCourse: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_PO.EDIT);

    // 2. validate
    if (!_id) {
      throw new LeadProductOrderInputError(params.translate('missingId'));
    }
    const existedLeadProductOrder: any = await params.repository.findById(_id);
    if (!existedLeadProductOrder) {
      throw new EntityNotFoundError('LeadProductOrder');
    }
    const validationSchema = yup.object().shape({
      //
    });
    await validationSchema.validate(data);

    // 3. do business logic

    // 4. persist to db
    await params.repository.addCourse(_id, {
      ...data,
      ...params.modificationInfo,
    });
    return {};
  },
  addCombo: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_PO.EDIT);

    // 2. validate
    if (!_id) {
      throw new LeadProductOrderInputError(params.translate('missingId'));
    }
    const existedLeadProductOrder: any = await params.repository.findById(_id);
    if (!existedLeadProductOrder) {
      throw new EntityNotFoundError('LeadProductOrder');
    }
    const validationSchema = yup.object().shape({
      //
    });
    await validationSchema.validate(data);

    // 3. do business logic

    // 4. persist to db
    await params.repository.addCombo(_id, {
      ...data,
      ...params.modificationInfo,
    });
    return {};
  },
  removeCombo: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_PO.EDIT);

    // 2. validate
    if (!_id) {
      throw new LeadProductOrderInputError(params.translate('missingId'));
    }
    const existedLeadProductOrder: any = await params.repository.findById(_id);
    if (!existedLeadProductOrder) {
      throw new EntityNotFoundError('LeadProductOrder');
    }
    const validationSchema = yup.object().shape({
      //
    });
    await validationSchema.validate(data);

    // 3. do business logic

    // 4. persist to db
    await params.repository.removeCombo(_id);
    return {};
  },
};

export default leadProductOrderService;
