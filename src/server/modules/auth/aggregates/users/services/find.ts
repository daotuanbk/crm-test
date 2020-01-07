import {
  validateQuery,
  autoFillQuery,
  ensurePermission,
  logger,
 } from '@app/core';
import _ from 'lodash';
import { roleRepository } from '../../roles/roles.repository';
import { PERMISSIONS } from '@common/permissions';

export const find = async (req: any) => {
  const {
    query,
    repository,
    authUser,
  } = req;
  // 1. authorize
  ensurePermission(authUser, PERMISSIONS.USERS.VIEW);

  // 2. validate
  const autoFilledQuery = autoFillQuery(query);
  validateQuery(autoFilledQuery);

  // 3. do business logic
  let filter = { } as any;

  if (query.centreId) {
    filter.centreId = query.centreId;
  }

  if (query.assignable === 'true') {
    const { permissions } = authUser;
    let leadOwnerPermission = permissions
      .filter((p: string) => p.includes('LEAD_OWNER.'))
      .map((val: any) => val.replace('LEAD_OWNER.', ''));
    // If lead to be assigned outside centre, only scope 'TO_WITHIN_ANY' can be applied
    if (String(_.get(authUser, 'centreId._id')) !== String(query.centreId)) {
      leadOwnerPermission = leadOwnerPermission.filter((p: string) => p.includes('TO_WITHIN_ANY'));
    }

    logger.info(`[User.Service] leadOwnerPermission = ${JSON.stringify(leadOwnerPermission)}`);

    const rolePermissionNames = _(leadOwnerPermission)
      .map((p: string) => p.split('.')[2]) // Only get the role scope
      .uniq() // Avoid duplicates
      .value();
    if (rolePermissionNames.length === 0) {
      return {
        data: [],
      };
    }
    logger.info(`[User.Service] rolePermissionNames = ${JSON.stringify(rolePermissionNames)}`);
    // If the role is 'TO_ANY_ROLE', there is nothing more to do
    if (!rolePermissionNames.includes('TO_ANY_ROLE')) {
      const permissionByRoles = rolePermissionNames.map((p: string) => ({
        'TO_GM_ROLE': 'ROLES.GENERALMANAGER',
        'TO_HO_ROLE': 'ROLES.SALE_HO',
      }[p]));

      const roles = await roleRepository.findByCriteria({
        permissions_in: permissionByRoles,
      });

      const roleIds = roles.map((role: any) => role._id);

      filter = {
        ...filter,
        roles: {
          '$in': roleIds,
        },
      };
    }
  }

  // Debug
  // return filter;

  logger.info(`[usesr.service] Find filter: ${JSON.stringify(filter)}`);

  // 4. persist to db
  return await repository.find(autoFilledQuery, filter);
};
