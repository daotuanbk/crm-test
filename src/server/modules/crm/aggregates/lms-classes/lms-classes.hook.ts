import { Hook, authenticate, logApiRequest, addCreationInfo, addModificationInfo } from '@app/core';

const productsHook: Hook = {
  before: {
    all: [
      authenticate,
      logApiRequest,
    ],
    create: [
      addCreationInfo,
    ],
    patch: [
      addModificationInfo,
    ],
  },
};

export default productsHook;
