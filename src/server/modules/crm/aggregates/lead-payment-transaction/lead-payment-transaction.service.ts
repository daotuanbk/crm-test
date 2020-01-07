import { LeadPaymentTransactionInputError, EntityNotFoundError, ensurePermission, validatePayload, validateOperation } from '@app/core';
import {
  calculateTuitionAD,
  LeadPaymentTransactionService,
  leadProductOrderRepository,
  leadRepository,
  leadPaymentTransactionRepository,
} from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';
import _ from 'lodash';

const leadPaymentTransactionsService: LeadPaymentTransactionService = {
  setup: (app, path) => {
    app.post(path + '/sync-pay-day', async (req: any, res: any) => {
      try {
        await leadPaymentTransactionRepository.syncPayDay();
        res.status(200).end();
      } catch (error) {
        res.status(error.status || 500).end(error.message || req.t('internalServerError'));
      }
    });
  },
  find: async ({ query, repository, authUser }) => {
    // 1. authorize
    ensurePermission(authUser, PERMISSIONS.LEAD_PAYMENT_TRANSACTION.VIEW);

    // 2. validate

    // 3. do business logic

    // 4. persist to db
    return await repository.find(query);
  },
  get: async (_id, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_PAYMENT_TRANSACTION.VIEW);

    // 2. validate
    if (!_id) {
      throw new LeadPaymentTransactionInputError(params.translate('missingId'));
    }

    // 3. do business logic

    // 4. persist to db
    return await params.repository.findById(_id);
  },
  create: async (data, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_PAYMENT_TRANSACTION.CREATE);

    // 2. validate
    await validatePayload({
      // Validate object
    }, data);

    // 3. do business logic
    updateLeadProductOrder(data);
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
    return await leadPaymentTransactionsService[data.operation](id, data.payload, params);
  },
  updateDetail: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.LEAD_PAYMENT_TRANSACTION.EDIT);

    // 2. validate
    if (!_id) {
      throw new LeadPaymentTransactionInputError(params.translate('missingId'));
    }
    const existedLeadPaymentTransaction: any = await params.repository.findById(_id);
    if (!existedLeadPaymentTransaction) {
      throw new EntityNotFoundError('LeadPaymentTransaction');
    }
    const validationSchema = yup.object().shape({
      //
    });
    await validationSchema.validate(data);

    // 3. do business logic

    // 4. persist to db
    return await params.repository.update({
      id: _id,
      ...data,
      ...params.modificationInfo,
    }) as any;
  },
  remove: async (id, { authUser, repository }) => {
    // 1. authorize
    ensurePermission(authUser, PERMISSIONS.LEAD_PAYMENT_TRANSACTION.DELETE);

    // 2. validate
    const existedLeadFilter = await repository.findById(id);
    if (!existedLeadFilter) {
      throw new EntityNotFoundError('ProductCombo');
    }

    // 3. do business logic

    // 4. persist to db
    await repository.del(id);
    return {};
  },
};

const updateLeadProductOrder = async (data: any) => {
  const {leadId, course, type, amount} = data;
  const lead = await leadRepository.findById(leadId) as any;
  if (!lead) return;
  const {productOrder} = lead;
  if (!productOrder) return;

  if (type === 'combo') {
    const {courses = []} = productOrder;
    const combo = productOrder.comboId || undefined;
    let courseCount = courses.length;
    if (combo) {
      if (combo.field !== 'courseCount' || (combo.field === 'courseCount' && combo.condition !== 'eq')) {
        //
      }
      else {
        courseCount = combo.conditionValue;
      }

      const tuitionAD = calculateTuitionAD(combo, courses.slice(0, courseCount));
      return await leadProductOrderRepository.updateCourses(`${productOrder._id}`, courses.slice(0, courseCount).map((item: any) => {
        const tuition = !item.tuition ? (Number(amount) || 0) : (Number(item.tuition) + Number(amount));
        const tuitionPercent = tuitionAD ? Math.floor(tuition * 100 / tuitionAD) : 0;
        return {
          index: item.index,
          tuition,
          tuitionPercent,
          tuitionAfterDiscount: tuitionAD,
        };
      }), true);
    }
  }
  else if (type === 'course') {
    const courseItem = productOrder.courses && productOrder.courses.find((item: any) => `${item._id}` === course);
    if (courseItem) {
      const tuition = !courseItem.tuition ? (Number(amount) || 0) : (Number(courseItem.tuition) + Number(amount));
      const discountCourse = courseItem.discountValue ?
          (courseItem.discountType === 'PERCENT' ?
              (Number(courseItem.tuitionBeforeDiscount || 0) * Number(courseItem.discountValue) / 100) :
              Number(courseItem.discountValue))
          : 0;
      const tuitionAfterDiscountCourse = Number(courseItem.tuitionBeforeDiscount || 0) - discountCourse;
      const tuitionPercent = tuitionAfterDiscountCourse ? Math.floor(tuition * 100 / tuitionAfterDiscountCourse) : 0;
      return await leadProductOrderRepository.updateCourses(`${productOrder._id}`, {
        index: courseItem.index,
        tuition,
        tuitionPercent,
        tuitionAfterDiscount: tuitionAfterDiscountCourse,
      }, true);
    }
  }
};

export default leadPaymentTransactionsService;
