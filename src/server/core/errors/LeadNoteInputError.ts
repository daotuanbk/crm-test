import { BadRequest } from '@feathersjs/errors';
export class LeadNoteInputError extends BadRequest {
  constructor(message: string) {
    super(message);
    this.name = 'LeadNoteInputError';
  }
}
