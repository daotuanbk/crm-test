import { IsAuditable } from '@app/core';

export interface Note extends IsAuditable {
  content: string;
}
