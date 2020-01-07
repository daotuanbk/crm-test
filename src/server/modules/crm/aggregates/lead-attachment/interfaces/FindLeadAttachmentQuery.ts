import { FindQuery } from '@app/core';

export interface FindLeadAttachmentQuery extends FindQuery {
  search?: string;
  filter?: any;
}
