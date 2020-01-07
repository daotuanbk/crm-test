import { FindQuery } from '@app/core';

export interface FindProspectingListQuery extends FindQuery {
  search?: string;
  filter?: any;
  authUser?: any;
}
