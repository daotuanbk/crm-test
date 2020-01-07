import {
  RequestParams,
  ensurePermission,
  validatePayload,
  GENDER_FEMALE,
  GENDER_MALE,
  GENDER_OTHER,
  RELATION_DAUGHTER,
  RELATION_SON,
  RELATION_GRAND_DAUGHTER,
  RELATION_GRAND_SON,
  RELATION_OTHER,
  RELATION_NEPHEW,
} from '@app/core';
import { ContactRepository, contactRepository, AddFamilyMemberPayload, FamilyMember } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';
import { config } from '@app/config';
import { get } from 'lodash';
import { BadRequest } from '@feathersjs/errors';

export const addFamilyMember = async (id: string, data: AddFamilyMemberPayload, params: RequestParams<ContactRepository>) => {
  // 1. authorize
  ensurePermission(params.authUser, PERMISSIONS.CONTACTS.EDIT);

  // 2. validate
  let existedContact: any;
  await validatePayload({
    id: yup.string()
      .required('Contact ID must be specified')
      .test('Existed Contact', 'Contact not found', async (value: string) => {
        existedContact = await contactRepository.findById(value);
        return !!existedContact;
      }),
    contactId: yup.string().nullable(true)
      .test('Existed Contact', 'Contact didnt exist', async (value: string) => {
        if (!value) {
          return true;
        }
        existedContact = await contactRepository.findById(value);
        return !!existedContact;
      }),
    contactInfo: yup.object()
      .shape({
        fullName: yup.string()
          .required('Please input full name'),
        phoneNumber: yup.string().nullable(true)
          .matches(config.regex.phone, 'Invalid phone number')
          .test('Phone number available', 'A contact exist with this phone number', async (value: string) => {
            if (!value) {
              return true;
            }
            const existedPhoneNumber = await contactRepository.findOne({phoneNumber: value});
            return !existedPhoneNumber;
          }),
        gender: yup.string().nullable(true)
          .oneOf([GENDER_FEMALE, GENDER_MALE, GENDER_OTHER], 'Invalid gender'),
        email: yup.string().nullable(true)
          .matches(config.regex.email, 'Invalid email address'),
        address: yup.string().nullable(true),
        dob: yup.string().nullable(true),
        facebook: yup.string().nullable(true),
        zalo: yup.string().nullable(true),
        school: yup.string().nullable(true),
      }).nullable(true),
      relation: yup.string().required('Relation must be specified')
        .oneOf([
          RELATION_DAUGHTER,
          RELATION_SON,
          RELATION_GRAND_DAUGHTER,
          RELATION_GRAND_SON,
          RELATION_NEPHEW,
          RELATION_OTHER,
        ], 'Invalid relation'),
  }, {
    ...data,
    id,
  });

  let contactInfo: any;
  if (data.contactId && existedContact) {
    // 3.1.1 check existedContact already contain data.contactId as a family member
    const familyMemberIds = existedContact.family.map((familyMember: FamilyMember) => familyMember._id.toString());
    if (familyMemberIds.indexOf(data.contactId)) {
      throw new BadRequest('This contact is already a family member');
    }

    // 3.1.2 update contact if neccessary
    contactInfo = await contactRepository.update({
      id: data.contactId,
      ...get(data, 'contactInfo', {}),
    });
  } else {
    // 3.2 create new contact
    const newContactInfo: any = {
      ...data.contactInfo,
      ...params.creationInfo,
    };
    contactInfo = await contactRepository.create(newContactInfo) as any;
  }

  // 4. add newContact as a family member of this contact
  const newFamilyMember = {
    _id: contactInfo._id,
    fullName: get(contactInfo, 'fullName', ''),
    phoneNumber: get(contactInfo, 'phoneNumber', ''),
    email: get(contactInfo, 'email', ''),
    relation: data.relation,
  };
  const updateInfo = {
    id,
    family: [...get(existedContact, 'family', []), newFamilyMember],
    ...params.modificationInfo,
  };
  await params.repository.update(updateInfo);

  return {};
};
