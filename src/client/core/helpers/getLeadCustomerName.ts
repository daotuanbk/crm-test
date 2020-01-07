import { Lead } from '@client/services/service-proxies';
import _ from 'lodash';

const getFullName = (info: any): string => {
  if (!info) return '';
  return info.fullName || (`${info.lastName || ''} ${info.firstName || ''}`);
};

export const getLeadCustomerName = (lead: Lead) => {
  const customerInfo = _.get(lead, 'customer._id', {});

  return getFullName(customerInfo);
};
