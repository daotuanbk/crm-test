import { Aggregate, IsAuditable } from '@app/core';

export interface LeadPaymentTransaction extends Aggregate, IsAuditable {
  leadId: any;
  paymentType: string;
  amount: number;
  note: string;
  payDay: string;
  course: string;
  tuition: {
    totalAfterDiscount: number;
    remaining: number;
  };
}
