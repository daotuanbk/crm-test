import { BadRequest } from '@feathersjs/errors';
export class StageInputError extends BadRequest {
  constructor(message: string) {
    super(message);
    this.name = 'StageInputError';
  }
}
