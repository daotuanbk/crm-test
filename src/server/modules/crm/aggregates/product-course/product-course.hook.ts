import { Hook, addCreationInfo, addModificationInfo, logApiRequest, authenticate } from '@app/core';
import { productCourseRepository } from '@app/crm';

const productCourseHook: Hook = {
  before: {
    all: [
      authenticate,
      logApiRequest,
      async (context: any) => {
        context.params.repository = productCourseRepository;
      },
    ],
    create: [
      addCreationInfo,
    ],
    patch: [
      addModificationInfo,
    ],
  },
};

export default productCourseHook;
