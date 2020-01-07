import { FindQuery } from '@app/core';

export interface FindLeadFiltersQuery extends FindQuery {
  owner?: string;
}
