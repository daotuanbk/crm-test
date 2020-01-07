import { FindQuery } from '@app/core';

export interface FindLeadHistoryQuery extends FindQuery {
  search?: string;
  filter?: any;
}
