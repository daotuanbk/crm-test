import { BadRequest } from '@feathersjs/errors';
export class LeadProductOrderInputError extends BadRequest {
  constructor(message: string) {
    super(message);
    this.name = 'LeadProductOrderInputError';
  }
}
