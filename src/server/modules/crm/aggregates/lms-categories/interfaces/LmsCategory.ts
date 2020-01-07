import { IsAuditable, Aggregate } from '@app/core';

export interface LmsCategory extends Aggregate, IsAuditable {
  _id: string;
  title: string;
  description: string;
  isDeleted: boolean;
}
