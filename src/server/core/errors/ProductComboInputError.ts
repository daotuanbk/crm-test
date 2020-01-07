import { BadRequest } from '@feathersjs/errors';
export class ProductComboInputError extends BadRequest {
  constructor(message: string) {
    super(message);
    this.name = 'ProductComboInputError';
  }
}
