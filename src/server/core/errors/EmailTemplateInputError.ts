import { BadRequest } from '@feathersjs/errors';
export class EmailTemplateInputError extends BadRequest {
  constructor(message: string) {
    super(message);
    this.name = 'EmailTemplateError';
  }
}
