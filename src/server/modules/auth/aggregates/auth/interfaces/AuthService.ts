import { RequestParams } from '@app/core';
import { AuthCreatePayload, UsersRepository, RolesRepository } from '@app/auth';

export interface AuthService {
  create: (data: AuthCreatePayload, params: RequestParams<UsersRepository> & { roleRepository: RolesRepository }) => Promise<{}>;
}
