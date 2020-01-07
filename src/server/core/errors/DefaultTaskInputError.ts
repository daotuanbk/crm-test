import { BadRequest } from '@feathersjs/errors';
export class DefaultTaskInputError extends BadRequest {
  constructor(message: string) {
    super(message);
    this.name = 'DefaultTaskInputError';
  }
}
