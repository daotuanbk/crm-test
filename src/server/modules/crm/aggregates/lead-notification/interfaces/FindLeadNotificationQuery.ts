import { FindQuery } from '@app/core';

export interface FindLeadNotificationQuery extends FindQuery {
  search?: string;
  filter?: any;
}
