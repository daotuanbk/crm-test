import { BadRequest } from '@feathersjs/errors';
export class ListInputError extends BadRequest {
  constructor(message: string) {
    super(message);
    this.name = 'ListInputError';
  }
}
