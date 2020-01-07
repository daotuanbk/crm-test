import { ensurePermission, RequestParams } from '@app/core';
import { LeadsRepository, FindLeadsQuery, leadRepository } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';

export const getArrangedRecords = async (params: RequestParams<LeadsRepository> & { query: FindLeadsQuery }) => {
  const { authUser } = params;

  // 1. authorize
  ensurePermission(authUser, PERMISSIONS.LEADS.VIEW);

  // 2. persist to db
  const data = await leadRepository.findByCriteria({
    'productOrder.courses.stage': {
      $in: ['Arranged', 'Tested'],
    },
  }, ['owner.id']);
  return {
    data,
  };
};
