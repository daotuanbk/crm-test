import { BadRequest } from '@feathersjs/errors';
export class LeadInputError extends BadRequest {
  constructor(message: string) {
    super(message);
    this.name = 'LeadInputError';
  }
}
