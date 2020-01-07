import { ContactRepository, contactRepository } from '@app/crm';
import { RequestParams, ensurePermission, validatePayload, GENDER_FEMALE, GENDER_MALE, GENDER_OTHER } from '@app/core';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';
import { config } from '@app/config';

export const create = async (data: any, params: RequestParams<ContactRepository>) => {
  // 1. authorize
  ensurePermission(params.authUser, PERMISSIONS.CONTACTS.CREATE);

  // 2. validate
  await validatePayload({
    fullName: yup.string().required('Fullname must be specified'),
    phoneNumber: yup.string().required('Please input phone number')
      .matches(config.regex.phone, 'Invalid phone number')
      .test('Phone number available', 'A contact exist with this phone number', async (value: string) => {
        const existedContact = await contactRepository.findOne({phoneNumber: value});
        return !existedContact;
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
  }, data);

  // 3. persist to db
  return await params.repository.create({
    ...data,
    ...params.creationInfo,
  }) as any;
};
