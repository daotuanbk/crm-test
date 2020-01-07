import { Repository, FindResult } from '@app/core';
import { User, FindUsersQuery } from '@app/auth';

export interface UsersRepository extends Repository<User> {
  findByRole: (role: string) => Promise<User[]>;
  find: (query: FindUsersQuery) => Promise<FindResult<User>>;
  findAll: (query: FindUsersQuery) => any;
  findSalesman: (salesmanRoleIds: string[]) => Promise<User[]>;
  findInterviewer: (interviewerRoleIds: string[]) => Promise<User[]>;
  findSalesmanByCentreId: (salesmanRoleIds: string[], centreId: string) => Promise<FindResult<User>>;
  getAuthUser: (id: string) => Promise<User & {permissions: string[]}>;
  getUserWithPermissions: (id: string) => Promise<User & {permissions: string[]}>;
}
