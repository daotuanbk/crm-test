import { FindQuery } from '@app/core';

export interface FindSystemConfigQuery extends FindQuery {
  search?: string;
  filter?: any;
}
