import { Hook } from '@app/core';

const webhooksHook: Hook = {
  after: {
    create: [
      async (context: any) => {
        context.params.io.to('fbchat').emit('messages', { data: context.data });
        context.statusCode = 200;
      },
    ],
  },
};

export default webhooksHook;
