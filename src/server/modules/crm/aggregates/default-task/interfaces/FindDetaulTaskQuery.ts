import { FindQuery } from '@app/core';

export interface FindDetaulTaskQuery extends FindQuery {
  search?: string;
  filter?: any;
}
