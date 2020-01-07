import { BadRequest } from '@feathersjs/errors';
export class ClassInputError extends BadRequest {
  constructor(message: string) {
    super(message);
    this.name = 'ClassInputError';
  }
}
