import { RequestParams, ensurePermission, autoFillQuery, validateQuery, validateOperation, NotAuthorizedError } from '@app/core';
import { userRepository } from '@app/auth';
import { LeadsRepository, FindLeadsQuery, Lead, leadRepository } from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import { getAllRecords } from './getAllRecords';
import { getArrangedRecords } from './getArrangeRecords';
import _ from 'lodash';

const OWNER_SCORES = {
  BY_ANY: 999,
  BY_OWNER: 1,
};

const CENTRE_SCORES = {
  WITHIN_ANY: 999,
  WITHIN_CENTRE: 1,
};

const mergeScope = (scope1: string, scope2: string, scores: any): string => {
  if (!scope1) return scope2;
  if (!scope2) return scope1;
  return scores[scope1] > scores[scope2] ? scope1 : scope2;
};

interface LeadViewPermission {
  ownerScope: string | null;
  centreScope: string | null;
  hasAnyPermission: boolean;
}

const mergeLeadViewPermissions = (permissions: string[]): LeadViewPermission => {
  return permissions
    .filter((q) => q.includes('LEADS_VIEW.'))
    .reduce((prevQuery: any, p: string): LeadViewPermission => {
      const scopes = p.replace('LEADS_VIEW.', '').split('.');
      const ownerScope = scopes[0];
      const centreScope = scopes[1];
      return {
        ownerScope: mergeScope(prevQuery.ownerScope, ownerScope, OWNER_SCORES),
        centreScope: mergeScope(prevQuery.centreScope, centreScope, CENTRE_SCORES),
        hasAnyPermission: true,
      };
    }, {
      ownerScope: null,
      centreScope: null,
      hasAnyPermission: false,
    });
};

const ensureLeadViewPermission = (leadViewPermissions: LeadViewPermission): void => {
  if (!leadViewPermissions.hasAnyPermission) {
    throw new NotAuthorizedError({ permission: 'LEADS_VIEW.', type: 'permission' });
  }
};

const execFixOwnerFullName = async (lead: Lead) => {
  const owner = await userRepository.findById(lead.owner.id);
  const ownerFullName = _.get(owner, 'fullName', 'No name');
  _.set(lead, 'owner.fullName', ownerFullName);
  await leadRepository.updateOneOwner(lead.id, lead.owner);
};

const fixOwnerFullName = async (leads: Lead[]) => {
  await Promise.all(
    leads
      .filter((lead: Lead) => {
        const id = _.get(lead, 'owner.id');
        const fullName = _.get(lead, 'owner.fullName');
        return id && !fullName;
      })
      .map(async (lead: Lead) => execFixOwnerFullName(lead)),
    );
};

export const find = async (params: RequestParams<LeadsRepository> & { query: FindLeadsQuery }) => {
  const { query, repository, authUser } = params;

  if (!query.operation) {
    // 1. Authorize
    ensurePermission(authUser, PERMISSIONS.LEADS.VIEW);
    const leadViewPermissions = mergeLeadViewPermissions(authUser!.permissions);
    ensureLeadViewPermission(leadViewPermissions);

    // 2. Set extra queries
    if (leadViewPermissions.ownerScope === 'BY_OWNER') {
      query.owner = _.get(authUser, '_id');
    }

    if (leadViewPermissions.centreScope === 'WITHIN_CENTRE') {
      query.centreId = _.get(authUser, 'centreId._id');
    }

    // 3. Auto fill then validate query
    const autoFilledQuery = autoFillQuery(query);

    // 3. Validate query
    validateQuery(autoFilledQuery);

    // 4. Handle bussiness logic and persist to db
    const result = await repository.find(autoFilledQuery);

    await fixOwnerFullName(result.data);

    return result;
  } else {
    validateOperation(query.operation, ['getAllRecords', 'getArrangedRecords']);

    switch (query.operation) {
      case 'getAllRecords':
        return await getAllRecords(params);
      case 'getArrangedRecords':
        return await getArrangedRecords(params);
      default:
        return {};
    }
  }
};
