export interface QueuePayload {
  payload: {
    operation: string;
    data: any;
  };
}

export const decodeQueueMessageValue = (value: any) => {
  const decoded = JSON.parse(value as string);
  return ((decoded as unknown) as QueuePayload).payload;
};
