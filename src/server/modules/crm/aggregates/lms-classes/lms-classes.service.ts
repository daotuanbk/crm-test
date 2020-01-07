import { LmsClassService } from '@app/crm';
import { find } from './services/find';
import { get } from './services/get';

const lmsClassService: LmsClassService = {
  find,
  get,
};

export default lmsClassService;
