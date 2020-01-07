import _ from 'lodash';
import {
  messageQueue,
  logger,
} from '@app/core';
import { config } from '@app/config';
import {
  QueueMessageOperation,
  lmsCourseRepository,
  decodeQueueMessageValue,
  sendLmsErrorMessage,
} from '@app/crm';

let consumerGroup: any;

const createConsumer = () => {
  logger.info('[Server][lms-courses] creating consumer');

  consumerGroup = messageQueue.consume({
    topic: config.queue.lmsCourseTopic,
    onMessage: async (message: any) => {
      try {
        const lmsCoursePayload = decodeQueueMessageValue(message.value);
        if (lmsCoursePayload.operation === QueueMessageOperation.UPSERT) {
          await lmsCourseRepository.upsert(lmsCoursePayload.data);
        } else if (lmsCoursePayload.operation === QueueMessageOperation.DELETE) {
          const _id = _.get(lmsCoursePayload.data, '_id');
          await lmsCourseRepository.del(_id);
        } else {
          throw new Error('Invalid operation');
        }
      } catch (err) {
        await sendLmsErrorMessage(message, err);
        logger.error(`[Kafka][Lms] ${JSON.stringify(err)}`);
      }
    },
  });
};

export default { createConsumer };
