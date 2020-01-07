import _ from 'lodash';
import {
  messageQueue,
  logger,
  renameField,
} from '@app/core';
import { config } from '@app/config';
import {
  QueueMessageOperation,
  lmsClassRepository,
  decodeQueueMessageValue,
  sendLmsErrorMessage,
} from '@app/crm';

let consumerGroup: any;

const createConsumer = () => {
  logger.info('[Server][lms-classes] creating consumer');

  consumerGroup = messageQueue.consume({
    topic: config.queue.lmsClassTopic,
    onMessage: async (message: any) => {
      logger.info('[Lms-classes][queue] onMessage: ' + JSON.stringify(message));
      try {
        const lmsClassPayload = decodeQueueMessageValue(message.value);
        if (lmsClassPayload.operation === QueueMessageOperation.UPSERT) {
          renameField(lmsClassPayload.data, 'course', 'lmsCourse');
          await lmsClassRepository.upsert(lmsClassPayload.data);
        } else if (lmsClassPayload.operation === QueueMessageOperation.DELETE) {
          const _id = _.get(lmsClassPayload.data, '_id');
          await lmsClassRepository.del(_id);
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
