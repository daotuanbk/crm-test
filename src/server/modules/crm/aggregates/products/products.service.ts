import { ProductsService } from '@app/crm';
import { find } from './services/find';
import { get } from './services/get';
import { create } from './services/create';
import { patch } from './services/patch';

const productsService: ProductsService = {
  find,
  get,
  create,
  patch,
};

export default productsService;
