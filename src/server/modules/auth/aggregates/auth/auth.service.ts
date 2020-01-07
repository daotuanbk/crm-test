
import admin from 'firebase-admin';
import { User, AuthService } from '@app/auth';
import { union } from 'lodash';

const authService: AuthService = {
  create: async (data, params) => {
    // 1. verify id token
    const verifyIdToken: any = await admin.auth().verifyIdToken(data.idToken);
    const userFirebaseInfo = await admin.auth().getUser(verifyIdToken.uid);

    // 2. add custom claims to firebase idToken
    const defaultRoles = await params.roleRepository.findDefaultRoles();
    if (!userFirebaseInfo.customClaims) {
      await admin.auth().setCustomUserClaims(verifyIdToken.uid, {
        roles: defaultRoles,
        permissions: defaultRoles ? union(defaultRoles.map((role) => role.permissions)) : [],
        avatarUrl: '',
      });
    }

    // 3. create new mongo user
    const existedUser = await params.repository.findById(verifyIdToken.uid);
    if (!existedUser) {
      const newUser: Partial<User> = {
        id: userFirebaseInfo.uid,
        email: userFirebaseInfo.email || userFirebaseInfo.providerData[0].email,
        phoneNo: userFirebaseInfo.phoneNumber,
        familyName: userFirebaseInfo.providerData[0] ? userFirebaseInfo.providerData[0].displayName : '',
        givenName: userFirebaseInfo.providerData[0] ? userFirebaseInfo.providerData[0].displayName : '',
        fullName: '',
        loginDetail: userFirebaseInfo.providerData[0].providerId === 'facebook.com'
          ? {
            uid: userFirebaseInfo.providerData[0] ? userFirebaseInfo.providerData[0].uid : '',
            email: userFirebaseInfo.providerData[0] ? userFirebaseInfo.providerData[0].email : '',
            provider: 'facebook',
          } : userFirebaseInfo.providerData[0].providerId === 'google.com' ? {
            uid: userFirebaseInfo.providerData[0] ? userFirebaseInfo.providerData[0].uid : '',
            email: userFirebaseInfo.providerData[0] ? userFirebaseInfo.providerData[0].email : '',
            provider: 'google',
          } : userFirebaseInfo.providerData[0].providerId === 'password' ? {
            email: userFirebaseInfo.providerData[0] ? userFirebaseInfo.providerData[0].email : '',
            provider: 'email',
          } : {
            phoneNo: userFirebaseInfo.phoneNumber,
            provider: 'phone',
          } as any,
        roles: defaultRoles.map((role) => role.id),
        isActive: true,
        completeSignUp: false,
        createdBy: userFirebaseInfo.uid,
        createdAt: new Date().getTime(),
      };
      await params.repository.create(newUser as any);
    }

    return {};
  },
};

export default authService;
