import { BadRequest } from '@feathersjs/errors';
export class RootContactInputError extends BadRequest {
  constructor(message: string) {
    super(message);
    this.name = 'RootContactInputError';
  }
}
