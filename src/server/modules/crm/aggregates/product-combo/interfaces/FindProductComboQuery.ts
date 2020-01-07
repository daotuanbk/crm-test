import { FindQuery } from '@app/core';

export interface FindProductComboQuery extends FindQuery {
  search?: string;
  filter?: any;
}
