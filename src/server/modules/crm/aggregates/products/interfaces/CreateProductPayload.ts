import { ProductCategories, ProductLines, ProductTypes } from '@app/crm';

export interface CreateProductPayload {
  name: string;
  code: string;
  price: number;
  category: ProductCategories;
  productLine: ProductLines;
  type: ProductTypes;
  course: string;
  maxCourses: number;
  maxDuration: number;
  isActive: boolean;
}
