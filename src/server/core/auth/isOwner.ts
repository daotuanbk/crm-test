import { AuthUser, NotAuthenticatedError } from '@app/core';
import _ from 'lodash';

export const isOwner = (authUser: AuthUser | undefined, ownerId: string) => {
  if (!authUser) {
    throw new NotAuthenticatedError();
  }
  return _.get(authUser, '_id') === ownerId;
};
