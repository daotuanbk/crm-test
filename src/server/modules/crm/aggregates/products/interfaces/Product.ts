import { IsAuditable, Aggregate } from '@app/core';

export enum ProductTypes {
  Single = 'Single',
  Combo = 'Combo',
  Special = 'Special',
}

export enum ProductCategories {
  Teens = 'Teens',
  Kids = 'Kids',
  Over18 = '18+',
}

export enum ProductLines {
  Game = 'Game',
  Web = 'Web',
  Other = 'Other',
  C4E = 'C4E',
  App = 'App',
  Data = 'Data',
}

export interface Product extends Aggregate, IsAuditable {
  _id: string;
  name: string;
  code: string;
  price: number;
  category: ProductCategories;
  productLine: ProductLines;
  type: ProductTypes;
  single: {
    course: string; // Reference ProductCourse table
  };
  combo: {
    maxCourses: number;
    selectableCourses: string[]; // Reference LmsCourse table
  };
  hasCombo: boolean; // Redundancy for sort
  special: {
    maxDuration: number; // Month
    selectableCourses: string[]; // Reference LmsCourse table
  };
  hasSpecial: boolean;  // Redundancy for sort
  isActive: boolean;
}
