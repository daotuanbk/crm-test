import { KafkaMessage } from './KafkaMessage';

export interface KafkaMessageRequest<T> {
  topic: string;
  message: KafkaMessage<T>;
}
