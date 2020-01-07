import { Product } from '@app/crm';

export enum DiscountTypes {
  Percent = 'Percent',
  Value = 'Value',
}

export enum PromotionTypes {
  SalesmanInput = 'SalesmanInput',
  SelectFromConfig = 'SelectFromConfig',
}

export enum ClassEnrollmentStatuses {
  NotEnrolled = 'Not Enrolled',
  Waiting = 'Waiting',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export interface ProductEnrollmentItem {
  _id?: string;
  course?: string; // Reference ProductCourse table
  class?: string; // Reference Class table
  status?: ClassEnrollmentStatuses;
  cancelled?: boolean;
  lmsOperationExecutive?: any;
}

export interface Promotion {
  promotionType: PromotionTypes;
  discountType: DiscountTypes;
  percent: number;
  value: number;
}

export interface OrderProductItem {
  _id?: string,
  candidate: string; // Reference Contact table
  product: Product;
  promotion: Promotion;
  enrollments: ProductEnrollmentItem[];
}

export interface LeadOrder {
  code: number;
  productItems: OrderProductItem[];
  isCancelled: boolean;
}
