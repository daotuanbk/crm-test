import { messageQueue } from '@app/core';
import { config } from '@app/config';
import _ from 'lodash';

export const sendLmsErrorMessage = async (originalMessage: any, error: any) => {
  await messageQueue.sendMessage({
    topic: config.queue.lmsErrorTopic,
    message: {
      ...originalMessage,
      error,
    },
  });
};
