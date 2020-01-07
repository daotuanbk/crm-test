import { Aggregate } from '@app/core';

export interface LeadProductOrder extends Aggregate {
  _id: string;
  leadId: string;
  courseCount: string;
  comboId: string;
  comboName: string;
  courses: [{
    _id: string;
    name: string;
    shortName: string;
    index: string;
    tuitionBeforeDiscount: number;
    discountType: string;
    discountValue: number;
    stage: string;
    status: string;
    class: string;
  }];
  createdAt: Date  | number;
  createdBy: string;
  updatedAt: Date  | number;
  lastModifiedAt: Date  | number;
  lastModifiedBy: string;
}
