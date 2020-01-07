import { BadRequest } from '@feathersjs/errors';
export class LeadTaskInputError extends BadRequest {
  constructor(message: string) {
    super(message);
    this.name = 'DefaultTaskInputError';
  }
}