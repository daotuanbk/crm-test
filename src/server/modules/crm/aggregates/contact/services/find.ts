import { RequestParams, ensurePermission, validateQuery, autoFillQuery } from '@app/core';
import { PERMISSIONS } from '@common/permissions';
import { ContactRepository } from '@app/crm';

export const find = async ({ query, repository, authUser }: RequestParams<ContactRepository>) => {
  // 1. authorize
  ensurePermission(authUser, PERMISSIONS.CONTACTS.VIEW);

  // 2. auto fill then validate query
  const filledQuery = autoFillQuery(query);

  // 3. validate query
  validateQuery(filledQuery);

  // 4. query db
  return await repository.find(filledQuery);
};
