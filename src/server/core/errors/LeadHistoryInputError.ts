import { BadRequest } from '@feathersjs/errors';
export class LeadHistoryInputError extends BadRequest {
  constructor(message: string) {
    super(message);
    this.name = 'LeadHistoryInputError';
  }
}
