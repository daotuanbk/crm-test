import { BadRequest } from '@feathersjs/errors';
export class StatusInputError extends BadRequest {
  constructor(message: string) {
    super(message);
    this.name = 'StatusInputError';
  }
}
