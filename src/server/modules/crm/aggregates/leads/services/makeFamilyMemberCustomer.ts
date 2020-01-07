import { ensurePermission } from '@app/core';
import { leadRepository } from '@app/crm';
import { BadRequest } from '@feathersjs/errors';
import { PERMISSIONS } from '@common/permissions';
import _ from 'lodash';

export const makeFamilyMemberCustomer = async (id: string, _data: any, params: any) => {
  const { authUser } = params;

  ensurePermission(authUser, PERMISSIONS.LEADS.EDIT);

  const lead = await leadRepository.findById(id);
  if (!lead) {
    throw new BadRequest('Lead not found');
  }

  const familyMemberCount = _.get(lead, 'customer.family.length', 0);

  if (familyMemberCount === 0) {
    throw new BadRequest('Customer has no family member to move');
  } else if (familyMemberCount > 1) {
    throw new BadRequest('Customer has more than 1 family member, this is not supported');
  }

  const familyMember = _.get(lead, 'customer.family.0._id');

  if (!_.get(familyMember, '_id')) {
    throw new BadRequest('This family member does not exist, contact technical support for help');
  }

  if (!_.get(familyMember, 'phoneNumber')) {
    throw new BadRequest('This family member does not have a phone number');
  }

  if (!_.get(familyMember, 'fullName')) {
    throw new BadRequest('This family member does not have a full name');
  }

  await leadRepository.update({
    id,
    customer: familyMember,
  });

  return await leadRepository.findById(id);
};
