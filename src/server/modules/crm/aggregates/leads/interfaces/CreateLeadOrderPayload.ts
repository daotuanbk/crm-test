import { Promotion } from '@app/crm';

export interface CreateLeadOrderPayload {
  orderItems: {
    candidate: string; // Reference Contact table
    product: string;
    promotion: Promotion;
  }[];
}
