import { BadRequest } from '@feathersjs/errors';
export class ProductCourseInputError extends BadRequest {
  constructor(message: string) {
    super(message);
    this.name = 'ProductCourseInputError';
  }
}
