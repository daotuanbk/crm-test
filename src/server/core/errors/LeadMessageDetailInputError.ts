import { BadRequest } from '@feathersjs/errors';
export class LeadMessageDetailInputError extends BadRequest {
  constructor(message: string) {
    super(message);
    this.name = 'LeadMessageDetailInputError';
  }
}
