import {
  Lead,
} from '@app/crm';
import _ from 'lodash';

export const getAllCandidates = (lead: Lead) => {
  const customer = _.get(lead, 'customer._id');
  const familyMembers = _.get(customer, 'family', []);

  const candidates = [
    ...familyMembers,
    _.omit(customer, 'family'),
  ];
  return candidates;
};
