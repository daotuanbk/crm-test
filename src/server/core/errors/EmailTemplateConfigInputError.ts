import { BadRequest } from '@feathersjs/errors';
export class EmailTemplateConfigInputError extends BadRequest {
  constructor(message: string) {
    super(message);
    this.name = 'EmailTemplateConfigInputError';
  }
}
