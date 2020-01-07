import { Repository, FindResult } from '@app/core';
import { Role, FindRolesQuery } from '@app/auth';

export interface RoleFindCriteria {
  permissions_in?: string[];
}

export interface RolesRepository extends Repository<Role> {
  findAll: () => Promise<Role[]>;
  find: (query: FindRolesQuery) => Promise<FindResult<Role>>;
  findByCriteria: (criteria: RoleFindCriteria) => Promise<Role[]>;
  findByIds: (ids: string[]) => Promise<Role[]>;
  findDefaultRoles: () => Promise<Role[]>;
  findSalesman: () => Promise<Role[]>;
  findInterviewer: () => Promise<Role[]>;
  upsertOne: (filter: any, update: any) => Promise<Role>;
  addPermissionIfNedeed: (filter: any, permission: string) => Promise<Role>;
}
