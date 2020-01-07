import { FindQuery } from '@app/core';

export interface FindMappingContactInfoQuery extends FindQuery {
  search?: string;
  filter?: any;
}
