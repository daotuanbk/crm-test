export interface KafkaMessage<T> {
  id: string;
  metadata: {
    service: string;
    module: string;
    aggregate: string;
    type: 'EVENT' | 'COMMAND';
    name: string;
    timestamp: string;
  };
  payload: T;
}
