import { leadRepository } from '@app/crm';

export const updateLeadCustomerFamily = async (newContactInfo: any, relation?: string) => {
  const leads = await leadRepository.findByCriteria({'customer.family._id': newContactInfo._id});
  const updateLeadCustomerFamilyPromises: any = [];

  for (const lead of leads) {
    const { family } = lead.customer;
    const newCustomerFamily = family.map((familyMember: any) => {
      if (familyMember._id.toString() === newContactInfo._id.toString()) {
        return {
          _id: newContactInfo._id,
          fullName: newContactInfo.fullName,
          phoneNumber: newContactInfo.phoneNumber,
          email: newContactInfo.email,
          relation: relation ? relation : familyMember.relation,
        };
      } else {
        return {
          _id: familyMember._id,
          fullName: familyMember.fullName,
          phoneNumber: familyMember.phoneNumber,
          email: familyMember.email,
          relation: familyMember.relation,
        };
      }
    });

    updateLeadCustomerFamilyPromises.push(leadRepository.update({
      id: lead._id,
      'customer.family': newCustomerFamily,
    } as any));
  }

  await Promise.all(updateLeadCustomerFamilyPromises);
};
