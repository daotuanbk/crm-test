import { FindQuery } from '@app/core';

export interface FindLeadPaymentTransactionQuery extends FindQuery {
  leadId: string;
}
