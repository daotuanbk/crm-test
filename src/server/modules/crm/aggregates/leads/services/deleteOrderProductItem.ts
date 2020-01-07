import {
  ensurePermission,
  UserInputError,
} from '@app/core';
import { PERMISSIONS } from '@common/permissions';
import { COMPLETE_STATUS } from '@common/stages';
import {
  leadRepository,
  calculateLeadTuition,
  findActiveEnrollmentInProductItem,
} from '@app/crm';
import _ from 'lodash';

export const deleteOrderProductItem = async (req: any, res: any) => {
  try {
    // 0. Parse payload and params
    const { id, orderProductItemId } = req.params;
    
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
      throw new UserInputError('This lead is COMPLETE, you CANNOT change order, if neccessary, request Sales manager for help');
    }

    const currentProductItems = _.get(existedLead, 'order.productItems');
    const currentProductItemsById = _.mapKeys(currentProductItems, '_id');
    const foundProductItem = currentProductItemsById[orderProductItemId];

    if (!foundProductItem) {
      throw new UserInputError('Product item not found in order of lead');
    }

    if (findActiveEnrollmentInProductItem(foundProductItem)) {
      throw new UserInputError('The order item has "Approved" or "Waiting" enrollment, you cannot delete it');
    }

    // Try to change first and see if the tuition if valid
    existedLead.order.productItems = _(currentProductItemsById).omit(orderProductItemId).values().value() as any;

    const leadTuitionIfDelete = calculateLeadTuition(existedLead);

    if (leadTuitionIfDelete.remaining < 0) {
      throw new UserInputError('Deleting this product item will make order value smaller than total paymnent, if neccessary, request Sales Manager to do it');
    }

    // 3. Do bussiness logic
    // 3.1 Delete product item
    const leadWithDeletedProductItem = await leadRepository.pullOrderProductItem(id, orderProductItemId);
   
    // 3.2 Recalculate the tuition
    const leadTuitionToUpdate = calculateLeadTuition(leadWithDeletedProductItem);
    const leadToReturn = await leadRepository.updateTuition(id, leadTuitionToUpdate);

    // 4. Return updated data
    res.status(200).json(leadToReturn);
  } catch (error) {
    res.status(error.code || 500).json({message: error.message || req.t('internalServerError')});
  }
};
