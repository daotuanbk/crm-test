import { contactRepository } from '@app/crm';

export const updateContactFamily = async (newContactInfo: any, relation?: string) => {
  const contacts = await contactRepository.findByCriteria({'family._id': newContactInfo._id});
  const updateContactFamilyPromises: any = [];

  for (const contact of contacts) {
    const { family } = contact;
    const newContactFamily = family.map((familyMember: any) => {
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

    updateContactFamilyPromises.push(contactRepository.update({
      id: contact._id,
      family: newContactFamily,
    }));
  }

  await Promise.all(updateContactFamilyPromises);
};
