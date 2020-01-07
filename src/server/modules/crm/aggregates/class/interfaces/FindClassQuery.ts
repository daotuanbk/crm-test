import { FindQuery } from '@app/core';

export interface FindClassQuery extends FindQuery {
  search?: string;
  filter?: any;
  authUser?: any;
  viewCentre?: boolean;
}
