import { removeEmpty, ensurePermission } from '@app/core';
import { UpdateLeadProductsPayload, PERMISSIONS, leadRepository, productsRepository } from '@app/crm';
import { BadRequest } from '@feathersjs/errors';
import _ from 'lodash';

export const updateLeadProducts = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const data: UpdateLeadProductsPayload = removeEmpty(req.body);

    // 1. authorize
    ensurePermission(req.authUser, PERMISSIONS.LEADS.EDIT);

    // 2. validate
    const existedLead = await leadRepository.findById(id);
    if (!existedLead) {
      throw new BadRequest('Lead not found');
    }

    const leadCandidates: any = [String((existedLead.customer._id as any)._id)];
    _.get(existedLead, 'customer.family', []).forEach((familyMember: any) => leadCandidates.push(String(familyMember._id._id)));
    for (const leadProduct of data.products) {
      if (leadCandidates.indexOf(leadProduct.candidate) === -1) {
        throw new BadRequest('Invalid candidate');
      }

      const existedProduct = await productsRepository.findById(leadProduct.product);
      if (!existedProduct) {
        throw new BadRequest('Product not found');
      }
    }

    // 3. update database
    const newLeadInfo = await leadRepository.update({
      id: existedLead._id,
      products: data.products,
    });
    res.status(200).json(newLeadInfo);
  } catch (error) {
    res.status(error.code || 500).json({message: error.message || req.t('internalServerError')});
  }
};
