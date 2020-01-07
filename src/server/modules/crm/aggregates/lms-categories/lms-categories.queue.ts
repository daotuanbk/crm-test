import _ from 'lodash';
import {
  messageQueue,
  logger,
} from '@app/core';
import { config } from '@app/config';
import {
  lmsCategoryRepository,
  lmsCourseRepository,
  sendLmsErrorMessage,
  QueueMessageOperation,
  decodeQueueMessageValue,
} from '@app/crm';

let consumerGroup: any;

const updateCategoriesInCategory = async (categoryFromLms: any) => {
  const categoryId = _.get(categoryFromLms, '_id');
  await lmsCourseRepository.pushCategoryIfNeeded(categoryFromLms.courses, categoryId);
  await lmsCourseRepository.popCategoryIfNeeded(categoryFromLms.courses, categoryId);
};

const createConsumer = () => {
  logger.info('[Server][lms-categories] creating consumer');

  consumerGroup = messageQueue.consume({
    topic: config.queue.lmsCourseCategoryTopic,
    onMessage: async (message: any) => {
      try {
        const lmsCategoryMessagePayload = decodeQueueMessageValue(message.value);
        logger.info('Handle message...');
        logger.info(lmsCategoryMessagePayload);
        if (lmsCategoryMessagePayload) {
          const operation = _.get(lmsCategoryMessagePayload, 'operation');
          const data = _.get(lmsCategoryMessagePayload, 'data');
          if (operation === QueueMessageOperation.UPSERT) {
            logger.info('UPSERT' + JSON.stringify(data));
            await lmsCategoryRepository.upsert(data);
            await updateCategoriesInCategory(data);
          } else if (operation === QueueMessageOperation.DELETE) {
            logger.info('DELETE' + JSON.stringify(data));
            await lmsCategoryRepository.del(data._id);
          } else {
            throw new Error('Invalid operation');
          }
        }
      } catch (err) {
        await sendLmsErrorMessage(message, err);
        logger.error(`[Kafka][Lms-Categories] ` + JSON.stringify(err));
      }
    },
  });
};

export default { createConsumer };
