import { BadRequest } from '@feathersjs/errors';
export class LeadAppointmentInputError extends BadRequest {
  constructor(message: string) {
    super(message);
    this.name = 'LeadAppointmentInputError';
  }
}
