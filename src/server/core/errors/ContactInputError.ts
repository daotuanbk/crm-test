import { BadRequest } from '@feathersjs/errors';
export class ContactInputError extends BadRequest {
  constructor(message: string) {
    super(message);
    this.name = 'ContactInputError';
  }
}
