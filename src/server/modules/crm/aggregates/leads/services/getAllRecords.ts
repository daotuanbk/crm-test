import { ensurePermission, RequestParams } from '@app/core';
import { LeadsRepository, FindLeadsQuery } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';

export const getAllRecords = async (params: RequestParams<LeadsRepository> & { query: FindLeadsQuery }) => {
  const { repository, authUser } = params;

  // 1. authorize
  ensurePermission(authUser, PERMISSIONS.LEADS.VIEW);

  // 2. persist to db
  const data = await repository.findAll();
  return {
    data,
  };
};
