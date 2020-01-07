import { Aggregate, IsAuditable } from '@app/core';

export interface Class extends Aggregate, IsAuditable {
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  centreId: string;
  courseId: string;
}
