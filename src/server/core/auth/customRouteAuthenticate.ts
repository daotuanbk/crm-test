import { replace } from 'lodash';
import admin from 'firebase-admin';
import { NotAuthenticatedError } from '@app/core';
import { config } from '@app/config';

export const customRouteAuthenticate = async (req: any, _res: any, next: any) => {
  try {
    const idToken = replace(req.headers.authorization, 'Bearer ', '');
    if (idToken === config.lms.token) {
      const authUser = {
        fromLms: true,
      };
      req.authUser = authUser;
    } else {
      const userRepository = require('../../modules/auth').userRepository;
      const decodedIdToken = await admin.auth().verifyIdToken(idToken);
      const authUser = await userRepository.getAuthUser(decodedIdToken.uid);

      req.authUser = authUser;
    }
    next();
  } catch (err) {
    throw new NotAuthenticatedError();
  }
};
