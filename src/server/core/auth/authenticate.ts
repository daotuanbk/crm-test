import { replace } from 'lodash';
import admin from 'firebase-admin';
import { HookContext } from '@feathersjs/feathers';
import { NotAuthenticatedError } from '@app/core';
import { config } from '@app/config';

export const authenticate = async (context: HookContext) => {
  try {
    const idToken = replace(context.params.authorization, 'Bearer ', '');
    if (idToken === config.lms.token) {
      const authUser = {
        fromLms: true,
      };
      context.params.authUser = authUser;
    } else {
      const decodedIdToken = await admin.auth().verifyIdToken(idToken);
      const authUser = await (context.app.service('/api/users') as any).getAuthUser(decodedIdToken.uid);
      context.params.authUser = authUser;
    }
  } catch (err) {
    throw new NotAuthenticatedError();
  }
};
