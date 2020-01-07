import { IsAuditable } from '@app/core';

export interface LeadProduct extends IsAuditable {
  candidate: string; // Reference 'Contact' table
  product: string; // Reference 'Product' table
}
