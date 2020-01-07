import { BadRequest } from '@feathersjs/errors';
export class ProspectingListInputError extends BadRequest {
  constructor(message: string) {
    super(message);
    this.name = 'ProspectingListInputError';
  }
}
