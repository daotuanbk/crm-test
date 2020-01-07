import { RequestParams, ensurePermission, LeadInputError } from '@app/core';
import { LeadsRepository } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';

export const get = async (id: string, params: RequestParams<LeadsRepository>) => {
  // 1. authorize
  ensurePermission(params.authUser, PERMISSIONS.LEADS.VIEW);

  // 2. validate
  if (!id) {
    throw new LeadInputError(params.translate('missingId'));
  }

  // 3. persist to db
  return await params.repository.findById(id);
};
