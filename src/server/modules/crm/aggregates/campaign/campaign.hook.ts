import { Hook, addCreationInfo, addModificationInfo, logApiRequest, authenticate } from '@app/core';
import { campaignRepository } from '@app/crm';

const campaignHook: Hook = {
  before: {
    all: [
      authenticate,
      logApiRequest,
      async (context: any) => {
        context.params.repository = campaignRepository;
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

export default campaignHook;
