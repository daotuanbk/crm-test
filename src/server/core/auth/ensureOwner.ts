import { AuthUser, NotAuthenticatedError, NotAuthorizedError } from '@app/core';
import _ from 'lodash';

export const ensureOwner = (authUser: AuthUser | undefined, ownerId: string) => {
  if (!authUser) {
    throw new NotAuthenticatedError();
  }

  if (_.get(authUser, '_id') !== ownerId) {
    throw new NotAuthorizedError({ type: 'owner' });
  }
};
