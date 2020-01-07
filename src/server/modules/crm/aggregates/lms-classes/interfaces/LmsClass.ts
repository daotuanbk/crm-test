import { Aggregate } from '@app/core';
export interface LmsClass extends Aggregate {
  _id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  lmsCourse: string; // Id of Course
}
