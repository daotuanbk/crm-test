import { Hook, authenticate, logApiRequest, addCreationInfo, addModificationInfo } from '@app/core';
import { leadFiltersRepository } from './lead-filters.repository';

const leadFiltersHook: Hook = {
  before: {
    all: [
      authenticate,
      logApiRequest,
      async (context: any) => {
        context.params.repository = leadFiltersRepository;
      },
    ],
    create: [
      addCreationInfo,
    ],
    patch: [
      addModificationInfo,
    ],
  },
  after: {
    create: [],
  },
};

export default leadFiltersHook;
