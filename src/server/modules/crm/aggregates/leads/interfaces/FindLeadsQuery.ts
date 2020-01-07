import { FindQuery } from '@app/core';

export interface FindLeadsQuery extends FindQuery {
  search?: string;
  filter?: any;
  authUser?: any;
  viewCentre?: boolean;
  limit?: number;
  page?: number;
}
