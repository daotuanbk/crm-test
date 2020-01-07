import {
  ensurePermission,
  validatePayload,
  GENDER_FEMALE,
  GENDER_MALE,
  GENDER_OTHER,
  RELATION_DAUGHTER,
  RELATION_SON,
  RELATION_GRAND_SON,
  RELATION_GRAND_DAUGHTER,
  RELATION_NEPHEW,
  RELATION_OTHER,
  removeEmpty,
} from '@app/core';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';
import { config } from '@app/config';
import { contactRepository, leadRepository, AddFamilyMemberPayload, FamilyMember } from '@app/crm';
import { get } from 'lodash';
import { BadRequest } from '@feathersjs/errors';

export const validateFamilyMemberInfo = async (data: AddFamilyMemberPayload) => {
  let existedContact: any;

  await validatePayload({
    contactId: yup.string().nullable(true)
      .test('Existed Contact', '[Candidate] Contact didnt exist', async (value: string) => {
        if (!value) {
          return true;
        }
        existedContact = await contactRepository.findById(value);
        return !!existedContact;
      }),
    contactInfo: yup.object()
      .shape({
        fullName: yup.string().required('[Candidate] Fullname must be specified'),
        phoneNumber: yup.string().nullable(true)
          .matches(config.regex.phone, '[Candidate] Invalid phone number')
          .test('Phone number available', '[Candidate] A contact exist with this phone number', async (value: string) => {
            if (!value || data.contactId) {
              return true;
            }
            const existedPhoneNumber = await contactRepository.findOne({phoneNumber: value});
            return !existedPhoneNumber;
          }),
        gender: yup.string().nullable(true)
          .oneOf([GENDER_FEMALE, GENDER_MALE, GENDER_OTHER], '[Candidate] Invalid gender'),
        email: yup.string().nullable(true)
          .matches(config.regex.email, '[Candidate] Invalid email address'),
        address: yup.string().nullable(true),
        dob: yup.string().nullable(true),
        facebook: yup.string().nullable(true),
        zalo: yup.string().nullable(true),
        school: yup.string().nullable(true),
      }).nullable(true),
    relation: yup.string().required('[Candidate] Relation must be specified')
      .oneOf([
        RELATION_DAUGHTER,
        RELATION_SON,
        RELATION_GRAND_DAUGHTER,
        RELATION_GRAND_SON,
        RELATION_NEPHEW,
        RELATION_OTHER,
      ], 'Invalid relation'),
  }, data);

  return {
    existedContact,
  };
};

export const execAddFamilyMember = async (existedLead: any, existedContact: any, data: AddFamilyMemberPayload, authUser: any) => {
  let contactInfo: any;
  if (data.contactId) {
    // 3.1.1 check existedContact already contain data.contactId as a family member
    const familyMemberIds = existedContact.family.map((familyMember: FamilyMember) => familyMember._id.toString());
    if (familyMemberIds.indexOf(data.contactId) > -1) {
      throw new BadRequest('[Candidate] This contact is already a family member');
    }

    // 3.1.2 update contact if neccessary
    contactInfo = await contactRepository.update({
      id: data.contactId,
      ...get(data, 'contactInfo', {}),
    });
  } else {
    // 3.2 create new Contact
    const newContactInfo: any = {
      ...data.contactInfo,
      createdBy: authUser._id,
      createdAt: new Date().getTime(),
    };
    contactInfo = await contactRepository.create(newContactInfo) as any;
  }

  // 4. add new contact as a family member of lead customer contact
  await contactRepository.update({
    id: existedLead.customer._id,
    family: [...get(existedLead, 'customer.family', []), {
      _id: contactInfo._id,
      fullName: contactInfo.fullName,
      phoneNumber: contactInfo.phoneNumber,
      email: contactInfo.email,
      relation: data.relation,
    }],
  });

  // 5. update lead customer
  return await leadRepository.update({
    id: existedLead._id,
    customer: {
      ...existedLead.customer,
      family: [...get(existedLead, 'customer.family', []), {
        _id: contactInfo._id,
        fullName: contactInfo.fullName,
        phoneNumber: contactInfo.phoneNumber,
        email: contactInfo.email,
        relation: data.relation,
      }],
    },
  });
};

export const addFamilyMember = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const data: AddFamilyMemberPayload = removeEmpty(req.body);

    // 1. authorize
    ensurePermission(req.authUser, PERMISSIONS.LEADS.EDIT);

    // 2. validate
    const existedLead = await leadRepository.findById(id);
    if (!existedLead) {
      throw new BadRequest('Lead not found');
    }
    const { existedContact } = await validateFamilyMemberInfo(data);

    // 2. business logic
    const newLeadInfo = await execAddFamilyMember(existedLead, existedContact, data, req.authUser);

    res.status(201).json(newLeadInfo);
  } catch (error) {
    res.status(error.code || 500).json({message: error.message || req.t('internalServerError')});
  }
};
