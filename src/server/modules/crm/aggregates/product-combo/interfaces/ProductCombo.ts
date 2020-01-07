import { Aggregate } from '@app/core';

export interface ProductCombo extends Aggregate {
  _id: string;
  name: string;
  field: string;
  condition: string;
  conditionValue: number;
  discountType: string;
  discountValue: number;
  createdAt: Date | number;
  createdBy: string;
  updatedAt: Date | number;
  lastModifiedAt: Date | number;
  lastModifiedBy: string;
}
