import { removeEmpty, ensurePermission, validatePayload, createObjectId } from '@app/core';
import { PERMISSIONS } from '@common/permissions';
import { leadRepository, UpdateProductEnrollmentItemPayload, lmsCourseRepository, lmsClassRepository, ClassEnrollmentStatuses, ProductTypes, LmsCourse } from '@app/crm';
import { BadRequest } from '@feathersjs/errors';
import _ from 'lodash';
import * as yup from 'yup';
import { sendEnrollmentRequestMessage } from './sendEnrollmentRequest';

const allowedEditEnrollmentStatuses = [ClassEnrollmentStatuses.NotEnrolled, ClassEnrollmentStatuses.Rejected, undefined];

export const updateProductEnrollmentItem = async (req: any, res: any) => {
  try {
    const { id, productItemId, productEnrollmentItemId } = req.params;
    const data: UpdateProductEnrollmentItemPayload = removeEmpty(req.body);

    // 1. authorize
    ensurePermission(req.authUser, PERMISSIONS.LEADS.EDIT);

    // 2. validate
    // 2.1 validate req.body
    await validatePayload({
      course: yup.string().required('Course must be specified')
        .test('Existed course', 'Course not found', async (value: string) => {
          const existedCourse = await lmsCourseRepository.findById(value);
          return !!existedCourse;
        }),
      class: yup.string().nullable(true)
        .test('Existed class', 'Class not found', async (value: string) => {
          if (!value) {
            return true;
          }
          const existedClass = await lmsClassRepository.findById(value);
          return !!existedClass;
        }),
    }, data);

    // 2.2 validate existed lead
    const existedLead = await leadRepository.findById(id);
    if (!existedLead) {
      throw new BadRequest('Lead not found');
    }

    // 2.3 validate existed productItem
    const productItemsById = _.mapKeys(existedLead.order.productItems, '_id');
    const existedProductItem = productItemsById[productItemId];
    if (!existedProductItem) {
      throw new BadRequest('Product item not found');
    }

    // 2.3 validate existed productEnrollmentItem
    const productEnrollmentItemsById = _.mapKeys(existedProductItem.enrollments, '_id');
    const existedProductEnrollmentItem = productEnrollmentItemsById[productEnrollmentItemId];
    if (!existedProductEnrollmentItem) {
      throw new BadRequest('Product enrollment item not found');
    }

    // 2.4 check if enrollment status allowed edit
    if (allowedEditEnrollmentStatuses.indexOf(existedProductEnrollmentItem.status!) === -1) {
      throw new BadRequest('Product enrollment item is not allowed to edit');
    }

    // 2.5 validate selectedCourse in side product selectable courses
    if (data.course && _.get(existedProductItem, 'product.type', '') === ProductTypes.Combo) {
      const selectableCourses = _.get(existedProductItem, 'product.combo.selectableCourses', []).map((course: LmsCourse) => String(course._id));
      if (selectableCourses.indexOf(data.course) === -1) {
        throw new BadRequest('Course not allowed in this product');
      }
    } else if (data.course && _.get(existedProductItem, 'product.type', '') === ProductTypes.Special) {
      const selectableCourses = _.get(existedProductItem, 'product.special.selectableCourses', []).map((course: LmsCourse) => String(course._id));
      if (selectableCourses.indexOf(data.course) === -1) {
        throw new BadRequest('Course not allowed in this product');
      }
    }

    // 3. update database
    const sendEnrollmentMessage = Boolean(data.class && data.course);
    const newProductEnrollmentItemInfo = {
      ...existedProductEnrollmentItem,
      ...data,
      status: sendEnrollmentMessage ? ClassEnrollmentStatuses.Waiting : ClassEnrollmentStatuses.NotEnrolled,
      cancel: false,
    };
    productEnrollmentItemsById[productEnrollmentItemId] = newProductEnrollmentItemInfo;
    existedProductItem.enrollments = _.values(productEnrollmentItemsById);
    productItemsById[productItemId] = existedProductItem;
    existedLead.order.productItems = _.values(productItemsById);

    // 4. send message to kafka if neccessary
    if (sendEnrollmentMessage) {
      const newProductItemsById = _.mapKeys(existedLead.order.productItems, '_id');
      const newProductItem = newProductItemsById[productItemId];
      const newProductEnrollmentItemsById = _.mapKeys(newProductItem.enrollments, '_id');
      const newProductEnrollmentItem = newProductEnrollmentItemsById[productEnrollmentItemId];
      newProductEnrollmentItem._id = newProductEnrollmentItem._id || createObjectId();
      await sendEnrollmentRequestMessage(req.authUser, existedLead, existedProductItem, newProductEnrollmentItem);
    }

    const newLeadInfo: any = await leadRepository.update({
      id,
      order: existedLead.order,
    });

    res.status(200).json(newLeadInfo);
  } catch (error) {
    res.status(error.code || 500).json({message: error.message || req.t('internalServerError')});
  }
};
