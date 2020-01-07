import { Hook, addCreationInfo, addModificationInfo, logApiRequest, authenticate } from '@app/core';
import { userRepository, roleRepository } from '@app/auth';
import { HookContext } from '@feathersjs/feathers';

const usersHook: Hook = {
  before: {
    all: [
      authenticate,
      logApiRequest,
      async (context: any) => {
        context.params.repository = userRepository;
      },
    ],
    create: [
      addCreationInfo,
      async ({ params }: HookContext) => {
        params.roleRepository = roleRepository;
      },
    ],
    patch: [
      addModificationInfo,
      async (context: any) => {
        context.params.roleRepository = roleRepository;
      },
    ],
  },
};

export default usersHook;
