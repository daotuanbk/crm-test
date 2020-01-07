import { FindQuery } from '@app/core';

export interface FindProspectingContactQuery extends FindQuery {
  search?: string;
  filter?: any;
}
