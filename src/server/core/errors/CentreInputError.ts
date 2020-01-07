import { BadRequest } from '@feathersjs/errors';
export class CentreInputError extends BadRequest {
  constructor(message: string) {
    super(message);
    this.name = 'CentreInputError';
  }
}
