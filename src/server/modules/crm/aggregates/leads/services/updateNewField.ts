import { RequestParams, ensurePermission, EntityNotFoundError } from '@app/core';
import { LeadsRepository } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';

export const updateNewField = async (id: string, _data: any, params: RequestParams<LeadsRepository>) => {
  // 1. authorize
  ensurePermission(params.authUser, PERMISSIONS.LEADS.EDIT);

  // 2. validate
  const lead: any = await params.repository.findById(id);
  if (!lead) {
    throw new EntityNotFoundError('Lead');
  }
  if (!lead.new) return {};
  await params.repository.update({
    id,
    new: false,
  });
  return {};
};
