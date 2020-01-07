import { IsAuditable } from '@app/core';

export interface LeadPayment extends IsAuditable {
  payday: Date;
  amount: number;
  note: string;
}
