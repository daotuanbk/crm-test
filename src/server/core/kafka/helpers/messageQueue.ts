import kafkajs from 'kafkajs';
import { KafkaMessageRequest, MessageMetadataTypes, MessageMetadata, MessagePayload, KafkaMessage } from '../interfaces';
import { getCurrentTimestamp } from '@app/core';
import { QueueMessageOperation } from '@app/crm';

let kafkaInstance: kafkajs.Kafka;
let kafkaProducer: kafkajs.Producer;
const kafkaConsumers: kafkajs.Consumer[] = [];

const sendMessages = async <T>(requests: KafkaMessageRequest<T>[]): Promise<void> => {
  const topicMessages = requests.map((request: KafkaMessageRequest<T>) => ({
    topic: request.topic,
    messages: [{ value: JSON.stringify(request.message), key: null }],
  }));
  await kafkaProducer.sendBatch({
    topicMessages,
    acks: -1,
    timeout: 30000,
    compression: kafkajs.CompressionTypes.GZIP,
  });
};

const sendMessage = async <T>(request: KafkaMessageRequest<T>): Promise<void> => {
  await kafkaProducer.send({
    messages: [{ value:  JSON.stringify(request.message), key: null }],
    topic: request.topic,
    compression: kafkajs.CompressionTypes.GZIP,
  });
};

const consume = async (params: {
  topic: string,
  onMessage: (message: any) => void,
}) => {
  const kafkaConsumer = kafkaInstance.consumer({ groupId: `crm_${params.topic}` });
  await kafkaConsumer.connect();
  await kafkaConsumer.subscribe({ topic: params.topic, fromBeginning: true });
  await kafkaConsumer.run({
    eachMessage: async (payload: kafkajs.EachMessagePayload) => {
      await params.onMessage(payload.message);
    },
  });
  kafkaConsumers.push(kafkaConsumer); // Store the consumers to keep it alive
  return kafkaConsumer;
};

export const bootstrapMessageQueue = (kafkaHost: string): void => {
  // kafkaHost = kafkaHost;
  kafkaInstance = new kafkajs.Kafka({
    clientId: 'crm_service',
    brokers: [kafkaHost],
  });
  kafkaProducer = kafkaInstance.producer();
};

// export const commitCurrentMessage = (consmerGroup: kafka.ConsumerGroup): Promise<any> => {
//   return new Promise((resolve, reject) => {
//     consmerGroup.commit((err, data) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(data);
//       }
//     });
//   });
// };

const createMetadata = (type: string) => {
  if (type !== MessageMetadataTypes.EVENT && type !== MessageMetadataTypes.COMMAND) {
    throw new Error('type is not valid, must be either EVENT or COMMAND');
  }

  return {
    type,
    timestamp: getCurrentTimestamp(),
  };
};

const createPayload = (operation: string, data: any) => {
  if (operation !== QueueMessageOperation.ENROLLMENT_REQUEST && operation !== QueueMessageOperation.ENROLLMENT_CANCEL_REQUEST) {
    throw new Error('operation is not valid, must be either ENROLLMENT_REQUEST or ENROLLMENT_CANCEL_REQUEST');
  }

  return {
    operation,
    data,
  };
};

const createMessage = (id: string, metadata: MessageMetadata, payload: MessagePayload) => {
  if (!id) {
    throw new Error('id must not be empty');
  }
  if (!metadata) {
    throw new Error('payload must not be empty');
  }
  if (!payload) {
    throw new Error('payload must not be empty');
  }

  return {
    id,
    metadata,
    payload,
  };
};

const createMessageRequest = (topic: string, message: KafkaMessage<any>) => {
  return {
    topic,
    message,
  };
};

export const messageQueue = {
  // createTopic,
  sendMessages,
  sendMessage,
  // createConsumerGroup,
  // commitCurrentMessage,
  createMetadata,
  createPayload,
  createMessage,
  createMessageRequest,
  consume,
};
