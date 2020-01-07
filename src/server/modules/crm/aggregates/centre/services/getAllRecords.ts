import { PERMISSIONS } from '@common/permissions';
import { ensurePermission } from '@app/core';

export const getAllRecords = async (req: any) => {
  const { repository, authUser } = req;
  // 1. authorize
  ensurePermission(authUser, PERMISSIONS.CENTRES.VIEW);

  // 2. validate

  // 3. do business logic

  // 4. persist to db
  const data = await repository.findAll();
  return await {
    data,
  };
};
