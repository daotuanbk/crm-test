import { BadRequest } from '@feathersjs/errors';
export class LeadNotificationInputError extends BadRequest {
  constructor(message: string) {
    super(message);
    this.name = 'LeadNotificationError';
  }
}
