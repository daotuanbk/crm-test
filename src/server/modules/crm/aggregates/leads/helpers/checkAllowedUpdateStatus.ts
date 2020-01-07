import { allowedUpdateStatuses } from '@common/stages';

export const checkAllowedUpdateStatus = (currentStatus: string, newStatus: string) => {
  if (!currentStatus || !newStatus) {
    return false;
  }

  const allowedStatuses = allowedUpdateStatuses[currentStatus];
  if (!allowedStatuses) {
    return false;
  }

  return allowedStatuses.indexOf(newStatus) > -1;
};
