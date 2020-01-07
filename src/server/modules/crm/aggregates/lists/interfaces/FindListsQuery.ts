import { FindQuery } from '@app/core';

export interface FindListsQuery extends FindQuery {
  search?: string;
  filter?: any;
}
