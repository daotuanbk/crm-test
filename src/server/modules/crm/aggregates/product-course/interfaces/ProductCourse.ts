import { Aggregate } from '@app/core';

export interface ProductCourse extends Aggregate {
  _id: string;
  name: string;
  shortName: string;
  description: string;
  order: number;
  tuitionBeforeDiscount: number;
  isAvailableInCombo: boolean;
  createdAt: Date | number;
  createdBy: string;
  updatedAt: Date | number;
  lastModifiedAt: Date | number;
  lastModifiedBy: string;
}
