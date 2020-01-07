import { FindQuery } from '@app/core';

export interface FindLeadMessageDetailQuery extends FindQuery {
  search?: string;
  filter?: any;
}
