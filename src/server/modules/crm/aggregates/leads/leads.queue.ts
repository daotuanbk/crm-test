import _ from 'lodash';
import {
  messageQueue,
  logger,
} from '@app/core';
import { config } from '@app/config';
import {
  QueueMessageOperation,
  decodeQueueMessageValue,
  sendLmsErrorMessage,
  leadRepository,
} from '@app/crm';

let consumerGroup: any;

const createConsumer = async () => {
  logger.info('[Server][leads] creating consumer');

  // consumerGroup = messageQueue.createConsumerGroup({
  //   topic: config.queue.enrollmentResultTopic,
  //   group: 'crm',
  //   kafkaHost: config.kafka.kafkaHost,
  //   fromOffset: 'earliest',
  // });

  consumerGroup = messageQueue.consume({
    topic: config.queue.enrollmentResultTopic,
    onMessage: async (message: any) => {
      try {
        const requestEnrollmentResultPayload = decodeQueueMessageValue(message.value);
        if (requestEnrollmentResultPayload.operation === QueueMessageOperation.ENROLLMENT_STATUS_UPDATE) {
          const lmsOperationExecutive = _.get(requestEnrollmentResultPayload, 'data.lmsOperationExecutive');
          const enrollStatus = _.get(requestEnrollmentResultPayload, 'data.status');
          const leadId = _.get(requestEnrollmentResultPayload, 'data.crmLeadId');
          const productItemId = _.get(requestEnrollmentResultPayload, 'data.crmProductItemId');
          const productEnrollmentItemId = _.get(requestEnrollmentResultPayload, 'data.crmProductEnrollmentItemId');

          const lead = await leadRepository.findById(leadId);
          const productItemsById = _.mapKeys(lead.order.productItems, '_id');
          const productItem = productItemsById[productItemId];
          const enrollmentsById = _.mapKeys(productItem.enrollments, '_id');
          const productEnrollmentItem = enrollmentsById[productEnrollmentItemId];

          productEnrollmentItem.status = enrollStatus;
          productEnrollmentItem.lmsOperationExecutive = lmsOperationExecutive;
          productItem.enrollments = _.values(enrollmentsById);
          lead.order.productItems = _.values(productItemsById);
          await leadRepository.update({
            id: leadId,
            order: lead.order,
          });
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
