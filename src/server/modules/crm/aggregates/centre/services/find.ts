import { validateQuery, ensurePermission, validateOperation, autoFillQuery } from '@app/core';
import { PERMISSIONS } from '@common/permissions';
import { getAllRecords } from './getAllRecords';
import _ from 'lodash';

const toCentreScopeScores = {
  'TO_WITHIN_ANY': 999,
  'TO_WITHIN_CENTRE': 1,
};

const dbFilterFromCentreScope = (centreScope: string) => {
  return (authUserCentreId: string) => {
    return {
      'TO_WITHIN_ANY': {},
      'TO_WITHIN_CENTRE': {
        _id: authUserCentreId,
      },
    }[centreScope];
  };
};

const greaterCentreScope = (scope1: any, scope2: any): string => {
  return toCentreScopeScores[scope1] > toCentreScopeScores[scope2] ? scope1 : scope2;
};

const mergeCentreScope = (permissions: any): string => {
  return _(permissions)
    .filter((p: string) => p.includes('LEAD_OWNER.')) // Only get LEAD_OWNER permissions
    .map((p: string) => p.replace('LEAD_OWNER.', '')) // Remove LEAD_OWNER from permissions
    .map((p: string) => p.split('.')[3]) // Get the centre scope
    .filter((scope: any) => scope) // Filter out the undefined
    .uniq() // Get unique scopes
    .reduce((prevScope, scope) => greaterCentreScope(prevScope, scope), 'TO_WITHIN_CENTRE'); // Get the greatest scope possible
};

export const find = async (req: any) => {
  const { query, repository, authUser } = req;

  if (!query.operation) {
    // 1. authorize
    ensurePermission(authUser, PERMISSIONS.CENTRES.VIEW);

    // 2. validate
    const autoFilledQuery = autoFillQuery(query);
    validateQuery(autoFilledQuery);

    // 3. do business logic
    let filter = {};
    if (autoFilledQuery.assignable === 'true') {
      // Get centre scope from permission
      const { permissions } = authUser;
      const centreScope = mergeCentreScope(permissions);
      filter = { ...dbFilterFromCentreScope(centreScope)(_.get(authUser, 'centreId._id')) };
    }

    // 4. persist to db
    return await repository.find(autoFilledQuery, filter);
  } else {
    validateOperation(query.operation, ['getAllRecords']);
    return await getAllRecords({ repository, authUser });
  }
};
