import { RequestParams, ensurePermission, ContactInputError } from '@app/core';
import { ContactRepository } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';

export const get = async (id: string, params: RequestParams<ContactRepository>) => {
  // 1. authorize
  ensurePermission(params.authUser, PERMISSIONS.CONTACTS.VIEW);

  // 2. validate
  if (!id) {
    throw new ContactInputError(params.translate('missingId'));
  }

  // 3. persist to db
  return await params.repository.findById(id);
};
