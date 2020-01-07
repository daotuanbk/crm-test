import { Aggregate, IsAuditable } from '@app/core';

export interface Centre extends Aggregate, IsAuditable {
  _id: string;
  shortName: string;
  name: string;
}
