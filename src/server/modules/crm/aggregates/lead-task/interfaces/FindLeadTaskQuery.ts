import { FindQuery } from '@app/core';

export interface FindLeadTaskQuery extends FindQuery {
  search?: string;
  filter?: any;
}
