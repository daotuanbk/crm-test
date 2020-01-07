import { IsAuditable } from '@app/core';

export interface LeadRefund extends IsAuditable {
  payday: Date;
  amount: number;
  note: string;
}
