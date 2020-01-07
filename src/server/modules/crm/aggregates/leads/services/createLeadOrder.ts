import {
  leadRepository,
  CreateLeadOrderPayload,
  productsRepository,
  calculatePromotionValue,
  calculateLeadTuition,
  ProductTypes,
  ClassEnrollmentStatuses,
  ProductEnrollmentItem,
  LeadStatuses,
} from '@app/crm';
import { removeEmpty, ensurePermission } from '@app/core';
import { PERMISSIONS } from '@common/permissions';
import { BadRequest } from '@feathersjs/errors';
import _ from 'lodash';

const allowedUpdateStatus = ['L1A', 'L1B', 'L1C', 'L2A', 'L2B', 'L2C', 'L2D', 'L2E', 'L2F', 'L2G', 'L2X', 'L3A', 'L3B', 'L3C', 'L3D', 'L4A', 'L4B', 'L4X'];

export const createLeadOrder = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const data: CreateLeadOrderPayload = removeEmpty(req.body);

    // 1. authorize
    ensurePermission(req.authUser, PERMISSIONS.LEADS.EDIT);

    // 2. validate
    // 2.1 validate if lead exist
    const existedLead = await leadRepository.findById(id);
    if (!existedLead) {
      throw new BadRequest('Lead not found');
    }

    // 2.2 validate if candidate is a valid contact + product for each candidate exist
    const orderProducts: any = {};
    const leadCandidates: any = [String((existedLead.customer._id as any)._id)];
    _.get(existedLead, 'customer.family', []).forEach((familyMember: any) => leadCandidates.push(String(familyMember._id._id)));

    if (data.orderItems.length === 0) {
      throw new BadRequest('Invalid products');
    }

    for (const orderItem of data.orderItems) {
      // Check if Candidate is Customer/Family member
      if (leadCandidates.indexOf(orderItem.candidate) === -1) {
        throw new BadRequest('Invalid candidate');
      }

      // Check if Product exists
      const existedProduct = await productsRepository.findById(orderItem.product);
      if (!existedProduct) {
        throw new BadRequest('Product not found');
      }

      // If promotion exists => make sure Promotion value <= Product price
      if (orderItem.promotion) {
        const promotionValue = calculatePromotionValue(orderItem.promotion, existedProduct);
        if (promotionValue > existedProduct.price) {
          throw new BadRequest('Invalid discount value');
        }
      }

      orderProducts[orderItem.product] = existedProduct;
    }

    // 3. create/update lead order
    const productItems: any = [];
    data.orderItems.forEach((orderItem) => {
      // Get product record for embedded, not reference
      const product = orderProducts[orderItem.product];

      // If promotion exists => Build promotion info for embedded
      let promotion: any;
      if (orderItem.promotion) {
        let value = 0;
        let percent = 0;
        if (_.get(orderItem, 'promotion.value')) {
          value = _.get(orderItem, 'promotion.value');
        }
        if (_.get(orderItem, 'promotion.percent')) {
          percent = _.get(orderItem, 'promotion.percent');
        }

        promotion = {
          ...orderItem.promotion,
          value,
          percent,
        };
      }

      // Build productEnrollments for "Single course Product"
      const productEnrollments: ProductEnrollmentItem[] = [];
      if (product.type === ProductTypes.Single) {
        productEnrollments.push({
          course: _.get(product, 'single.course'),
          status: ClassEnrollmentStatuses.NotEnrolled,
          cancelled: false,
        });
      } else if (product.type === ProductTypes.Combo) {
        for (let i = 0; i < _.get(product, 'combo.maxCourses', 0); i += 1) {
          productEnrollments.push({
            status: ClassEnrollmentStatuses.NotEnrolled,
            cancelled: false,
          });
        }
      }

      const productItem = {
        product: orderProducts[orderItem.product],
        candidate: orderItem.candidate,
        promotion,
        enrollments: productEnrollments,
      };

      productItems.push(productItem);
    });

    // 3. update database
    const leadOrder = {
      code: new Date().getTime(),
      productItems,
      isCancelled: false,
    };
    const leadWithNewOrder = await leadRepository.updateOrder(id, leadOrder);

    // 4. If v2Status is in L1, L2, L3, L4 => Auto update to L5A
    let updateV2Status = false;
    if (allowedUpdateStatus.indexOf(existedLead.v2Status) > -1) {
      updateV2Status = true;
    }
    await leadRepository.update({
      id,
      v2Status: updateV2Status ? LeadStatuses.L5A : existedLead.v2Status,
    });

    // 5. calculate new lead tuition => update database
    const newLeadTuition = calculateLeadTuition(leadWithNewOrder);
    const newLeadInfo = await leadRepository.updateTuition(id, newLeadTuition);

    res.status(200).json(newLeadInfo);
  } catch (error) {
    res.status(error.code || 500).json({message: error.message || req.t('internalServerError')});
  }
};
