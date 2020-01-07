import { ensurePermission, validatePayload, GENDER_FEMALE, GENDER_MALE, GENDER_OTHER, removeEmpty } from '@app/core';
import { PERMISSIONS, leadRepository, contactRepository } from '@app/crm';
import * as yup from 'yup';
import { config } from '@app/config';
import { updateContactFamily } from '../helpers/updateContactFamily';
import { updateLeadCustomerFamily } from '../helpers/updateLeadCustomerFamily';
import { updateLeadsCustomer } from '../helpers/updateLeadsCustomer';

export const updateCustomer = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const data = removeEmpty(req.body);

    // 1. authorize
    ensurePermission(req.authUser, PERMISSIONS.LEADS.EDIT);

    // 2. validate
    let existedLead: any;
    await validatePayload({
      id: yup.string().required('Lead ID must be specified')
        .test('Existed Lead', 'Lead not found', async (value: string) => {
          existedLead = await leadRepository.findById(value);
          return !!existedLead;
        }),
      fullName: yup.string().nullable(true),
      gender: yup.string().nullable(true)
        .oneOf(['', GENDER_FEMALE, GENDER_MALE, GENDER_OTHER], 'Invalid gender'),
      email: yup.string().nullable(true)
        .matches(config.regex.email, 'Invalid email address'),
      address: yup.string().nullable(true),
      dob: yup.string().nullable(true),
      facebook: yup.string().nullable(true),
      zalo: yup.string().nullable(true),
      school: yup.string().nullable(true),
    }, {
      id,
      ...data,
    });

    // 3. update contact info
    const newContactInfo: any = await contactRepository.update({
      id: existedLead.customer._id,
      ...data,
    });

    // 4. update lead customer info
    const newLeadInfo = await leadRepository.update({
      id,
      customer: {
        _id: newContactInfo._id,
        fullName: newContactInfo.fullName,
        phoneNumber: newContactInfo.phoneNumber,
        email: newContactInfo.email,
        family: newContactInfo.family,
      },
    });

    // 4. update all contact which has this contact as a family member + update all lead which customer has this contact as a family member
    await Promise.all([
      updateLeadsCustomer(newContactInfo),
      updateContactFamily(newContactInfo),
      updateLeadCustomerFamily(newContactInfo),
    ]);

    res.status(201).json(newLeadInfo);
  } catch (error) {
    res.status(error.code || 500).json({message: error.message || req.t('internalServerError')});
  }
};
