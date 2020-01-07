import {
  ensurePermission,
  validatePayload,
  removeEmpty,
  UserInputError,
} from '@app/core';
import { PERMISSIONS } from '@common/permissions';
import { COMPLETE_STATUS } from '@common/stages';
import * as yup from 'yup';
import {
  leadRepository,
  calculateLeadTuition,
  getAllCandidates,
  productsRepository,
  PromotionTypes,
  DiscountTypes,
  Product,
  Promotion,
} from '@app/crm';
import _ from 'lodash';

interface OrderProductItemPayload {
  candidate: string;
  product: string;
  promotion: Promotion;
}

export const addOrderProductItem = async (req: any, res: any) => {
  try {
    // 0. Parse payload and params
    const { id } = req.params;
    const orderProductItemPayload: OrderProductItemPayload = removeEmpty(req.body);

    // 1. Authorize
    ensurePermission(req.authUser, PERMISSIONS.LEADS.EDIT);

    // 2. Validate
    const existedLead = await leadRepository.findById(id);
    if (!existedLead) {
      throw new UserInputError('Lead not found');
    }

    if (!existedLead.order) {
      throw new UserInputError('Order is not made for this lead, make order first');
    }

    if (existedLead.v2Status === COMPLETE_STATUS) {
      throw new UserInputError('This lead is COMPLETE, you CANNOT add more order item, if neccessary, request Sales manager for help');
    }

    const allCandidates = getAllCandidates(existedLead);
    const allCandidateIds = _.flatMap(allCandidates, '_id').map(String);

    await validatePayload({
      candidate: yup.string()
        .required('"candidate" cant be empty')
        .test('Candidate must be included in lead', 'This candidate is not in current lead', (value: string) => {
          return allCandidateIds.includes(value);
        }),
      product: yup.string()
        .required('"product" cant be empty'),
      promotion: yup.object().shape({
        promotionType: yup.string()
          .required('Promotion type is required')
          .oneOf([PromotionTypes.SalesmanInput, PromotionTypes.SelectFromConfig]),
        discountType: yup.string()
          .required('Promotion discount type is required')
          .oneOf([DiscountTypes.Percent, DiscountTypes.Value], 'Promotion discount type is neither Percent or Value'),
        percent: yup.number()
          .when('discountType', {
            is: (value: string) => value === DiscountTypes.Percent,
            then: yup.number().required('Promotion percent is required').positive('Promotion discount percent must be positive'),
          }),
        value: yup.number()
          .when('discountType', {
            is: (value: string) => value === DiscountTypes.Value,
            then: yup.number().required('Promotion value is required').min(1000, 'Promotion discount value must be greater than 1000'),
          }),
      }).default(null).nullable(true),
    }, orderProductItemPayload);

    const existedProduct: Product = await productsRepository.findById(orderProductItemPayload.product);

    if (!existedProduct) {
      throw new UserInputError('This product does NOT exist');
    }

    // 3. Do bussiness logic
    // 3.1 Add new product item
    const leadWithAddedProductItem = await leadRepository.pushOrderProductItem(id, {
      product: existedProduct, // Save the snapshot of the product
      candidate: orderProductItemPayload.candidate,
      promotion: orderProductItemPayload.promotion,
      enrollments: [],
    });
    // 3.2 Recalculate the tuition
    const leadTuitionToUpdate = calculateLeadTuition(leadWithAddedProductItem);
    const leadToReturn = await leadRepository.updateTuition(id, leadTuitionToUpdate);

    // 4. Return updated data
    res.status(201).json(leadToReturn);

  } catch (error) {
    res.status(error.code || 500).json({message: error.message || req.t('internalServerError')});
  }
};
