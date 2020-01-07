import { FindQuery } from '@app/core';

export interface FindEmailTemplateConfigQuery extends FindQuery {
  search?: string;
  filter?: any;
}
