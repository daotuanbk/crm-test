import { leadRepository } from '@app/crm';

export const updateLeadsCustomer = async (newContactInfo: any) => {
  const leads = await leadRepository.findByCriteria({'customer._id': newContactInfo._id});
  const updateLeadCustomerPromises: any = [];

  for (const lead of leads) {
    updateLeadCustomerPromises.push(leadRepository.update({
      id: lead._id,
      'customer.fullName': newContactInfo.fullName,
      'customer.phoneNumber': newContactInfo.phoneNumber,
      'customer.email': newContactInfo.email,
      'customer.family': newContactInfo.family,
    } as any));
  }

  await Promise.all(updateLeadCustomerPromises);
};
