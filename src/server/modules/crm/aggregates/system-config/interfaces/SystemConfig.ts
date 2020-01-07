import { Aggregate, IsAuditable } from '@app/core';

export interface SystemConfig extends Aggregate, IsAuditable {
  option: {
    type: string;
  };
  value: any;
}
