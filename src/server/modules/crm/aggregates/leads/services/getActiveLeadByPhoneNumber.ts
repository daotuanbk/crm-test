import { ensurePermission } from '@app/core';
import { PERMISSIONS } from '@common/permissions';
import { BadRequest } from '@feathersjs/errors';
import { leadRepository, LeadStatuses } from '@app/crm';

export const getActiveLeadByPhoneNumber = async (req: any, res: any) => {
  try {
    // 1. authorize
    ensurePermission(req.authUser, PERMISSIONS.LEADS.VIEW);

    // 2. validate
    const { phoneNumber } = req.params;
    if (!phoneNumber) {
      throw new BadRequest('Phone number must be specified');
    }

    // 3. query db
    const activeLead = await leadRepository.findOne({
      'v2Status': { $ne: LeadStatuses.L5C },
      'customer.phoneNumber': phoneNumber,
      'isDeleted': { $ne: true },
    }, [
      'customer._id', 'customer.family._id', 'productOrder.comboId', 'notes.createdBy', 'appointments.createdBy', 'products.candidate', 'products.course',
    ]);

    res.status(200).json(activeLead);
  } catch (error) {
    res.status(error.code || 500).json({message: error.message || req.t('internalServerError')});
  }
};
