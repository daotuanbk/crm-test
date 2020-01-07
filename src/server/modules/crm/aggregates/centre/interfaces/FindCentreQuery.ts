import { FindQuery } from '@app/core';

export interface FindCentreQuery extends FindQuery {
  search?: string;
  filter?: any;
}
