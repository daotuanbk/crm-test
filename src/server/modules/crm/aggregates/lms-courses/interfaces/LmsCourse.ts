import { Aggregate } from '@app/core';
import { LmsCategory } from '@app/crm';

export interface LmsCourse extends Aggregate {
  _id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  categories: [LmsCategory];
}
