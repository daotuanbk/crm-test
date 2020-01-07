import {
  ensurePermission,
  validatePayload,
  GENDER_FEMALE,
  GENDER_MALE,
  GENDER_OTHER,
  RELATION_DAUGHTER,
  RELATION_SON,
  RELATION_GRAND_DAUGHTER,
  RELATION_GRAND_SON,
  RELATION_NEPHEW,
  RELATION_OTHER,
  removeEmpty,
} from '@app/core';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';
import { leadRepository, contactRepository } from '@app/crm';
import { config } from '@app/config';
import { unset } from 'lodash';
import { updateContactFamily } from '../helpers/updateContactFamily';
import { updateLeadCustomerFamily } from '../helpers/updateLeadCustomerFamily';
import { updateLeadsCustomer } from '../helpers/updateLeadsCustomer';

export const updateFamilyMember = async (req: any, res: any) => {
  try {
    const { id, familyMemberId } = req.params;
    const data = removeEmpty(req.body);

    // 1. authorize
    ensurePermission(req.authUser, PERMISSIONS.LEADS.EDIT);

    // 2. validate
    let existedLead: any;
    let existedContact: any;
    await validatePayload({
      id: yup.string().required('Lead ID must be specified')
        .test('Existed Lead', 'Lead not found', async (value: string) => {
          existedLead = await leadRepository.findById(value);
          return !!existedLead;
        }),
      familyMemberId: yup.string().required('Family member ID must by specified')
        .test('Existed Contact', 'Contact not found', async (value: string) => {
          existedContact = await contactRepository.findById(value);
          return !!existedContact;
        }),
      fullName: yup.string().nullable(true),
      phoneNumber: yup.string().nullable(true)
        .matches(config.regex.phone, 'Invalid phone number')
        .test('Phone number available', 'A contact exist with this phone number', async (value: string) => {
          if (!value) {
            return true;
          }
          const existedPhoneNumber = await contactRepository.findOne({phoneNumber: value});
          if (existedPhoneNumber && existedPhoneNumber._id.toString() === familyMemberId) {
            return true;
          }
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
      relation: yup.string().nullable(true)
        .oneOf([
          RELATION_DAUGHTER,
          RELATION_SON,
          RELATION_GRAND_DAUGHTER,
          RELATION_GRAND_SON,
          RELATION_NEPHEW,
          RELATION_OTHER,
        ], 'Invalid relation'),
    }, {
      id,
      familyMemberId,
      ...data,
    });

    // 3. update contact info
    const contactUpdateInfo = {
      id: familyMemberId,
      ...data,
    };
    unset(contactUpdateInfo, 'relation'); // Contact record doesnt contain 'relation'
    const newContactInfo = await contactRepository.update(contactUpdateInfo);

    // 4. update all contact which has this contact as a family member + update all lead which customer has this contact as a family member
    await Promise.all([
      updateLeadsCustomer(newContactInfo),
      updateContactFamily(newContactInfo, data.relation),
      updateLeadCustomerFamily(newContactInfo),
    ]);

    const newLeadInfo = await leadRepository.findById(id);
    res.status(201).json(newLeadInfo);
  } catch (error) {
    res.status(error.code || 500).json({message: error.message || req.t('internalServerError')});
  }
};
