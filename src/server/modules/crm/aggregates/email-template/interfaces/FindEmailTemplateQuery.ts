import { FindQuery } from '@app/core';

export interface FindEmailTemplateQuery extends FindQuery {
  search?: string;
  filter?: any;
}
