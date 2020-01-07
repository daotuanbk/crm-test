import { FindQuery } from '@app/core';

export interface FindLeadConversationQuery extends FindQuery {
  search?: string;
  filter?: any;
}
