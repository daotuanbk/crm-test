import { ensurePermission, validatePayload, RequestParams, GENDER_FEMALE, GENDER_MALE, GENDER_OTHER, removeEmpty } from '@app/core';
import { PERMISSIONS } from '@common/permissions';
import * as yup from 'yup';
import { contactRepository, ContactRepository } from '@app/crm';
import { unset } from 'lodash';
import { config } from '@app/config';

export const updateDetail = async (id: string, data: any, params: RequestParams<ContactRepository>) => {
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
    fullName: yup.string().nullable(true),
    gender: yup.string().nullable(true)
      .oneOf([GENDER_FEMALE, GENDER_MALE, GENDER_OTHER]),
    email: yup.string().nullable(true)
      .matches(config.regex.email, 'Invalid email address'),
    address: yup.string().nullable(true),
    dob: yup.string().nullable(true),
    facebook: yup.string().nullable(true),
    zalo: yup.string().nullable(true),
    school: yup.string().nullable(true),
  }, {
    ...data,
    id,
  });

  // 3. persist to db
  const updateInfo = removeEmpty({
    id,
    ...data,
    ...params.modificationInfo,
  });
  unset(updateInfo, ['phoneNumber']); // Not allowed update phone number
  await params.repository.update(updateInfo);

  return {};
};
