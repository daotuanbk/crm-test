import { FindQuery } from '@app/core';

export interface FindContactQuery extends FindQuery {
  search?: string;
  authUser?: any;
}
