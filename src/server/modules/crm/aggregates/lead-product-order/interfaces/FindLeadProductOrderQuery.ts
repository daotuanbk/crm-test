import { FindQuery } from '@app/core';

export interface FindLeadProductOrderQuery extends FindQuery {
  search?: string;
  filter?: any;
}
